const Product = require('../models/productModel');
const Attribute = require('../models/attributeModel');
const { toSlug } = require('../utils/helpers');
const { deleteFile } = require('../utils/fileHelpers');
const pool = require('../config/db');
const productService = {
index: async (filters) => {
        return await Product.getAll(filters);
    },

    show: async (id) => {
        const product = await Product.getById(id);
        if (!product) return null;
        product.images = await Product.getImages(id);
        product.attributes = await Product.getAttributes(id);
        return product;
    },

    store: async (data, files) => {
        // Logic xử lý slug (Giữ nguyên)
        let slug = data.slug || toSlug(data.name);
        let exists = await Product.slugExists(slug);
        let counter = 1;
        let newSlug = slug;
        while (exists) {
            newSlug = `${slug}-${counter}`;
            exists = await Product.slugExists(newSlug);
            counter++;
        }

        const productData = {
            category_id: data.category_id,
            name: data.name,
            slug: newSlug,
            thumbnail: files?.thumbnail ? files.thumbnail[0].filename : (data.thumbnail || ''),
            content: data.content,
            description: data.description,
            standard: data.standard,
            application: data.application,
            created_by: data.created_by || 1
        };

        const productId = await Product.create(productData);

        if (files?.images) {
            for (const file of files.images) {
                await Product.addImage(productId, file.filename);
            }
        }

        if (data.attributes) {
            try {
                const attrs = typeof data.attributes === 'string' ? JSON.parse(data.attributes) : data.attributes;
                for (const attr of attrs) {
                    await Product.addAttribute(productId, attr.attribute_id, attr.value);
                }
            } catch (e) { console.error("Lỗi attributes store:", e.message); }
        }
        return productId;
    },

    update: async (id, data, files) => {
        // 1. Xử lý Slug nếu đổi tên
        if (data.name && !data.slug) {
            let slug = toSlug(data.name);
            let exists = await Product.slugExists(slug, id);
            let counter = 1;
            let newSlug = slug;
            while (exists) {
                newSlug = `${slug}-${counter}`;
                exists = await Product.slugExists(newSlug, id);
                counter++;
            }
            data.slug = newSlug;
        }

        const updateData = { ...data };
        const imagesToDelete = updateData.deleted_images;
        const attributesToUpdate = updateData.attributes;

        // Dọn dẹp dữ liệu thừa trước khi đưa vào hàm UPDATE của Model
        delete updateData.deleted_images;
        delete updateData._method;
        delete updateData.attributes;

        // 🟢 2. XỬ LÝ THUMBNAIL (Phải làm TRƯỚC khi gọi Product.update)
        if (files && files['thumbnail']) {
            const oldProduct = await Product.getById(id);
            if (oldProduct && oldProduct.thumbnail) {
                await deleteFile(oldProduct.thumbnail); // Xóa file vật lý cũ
            }
            updateData.thumbnail = files['thumbnail'][0].filename; // Gán tên mới vào bộ dữ liệu cập nhật
        }

        // 🟢 3. CẬP NHẬT DATABASE (Chỉ gọi 1 lần duy nhất)
        const affected = await Product.update(id, updateData);
        if (!affected) throw new Error('Không tìm thấy sản phẩm hoặc dữ liệu không đổi');

        // 🟢 4. XỬ LÝ XÓA TỈA ẢNH PHỤ (Dọn rác vật lý + DB)
        if (imagesToDelete) {
            try {
                const ids = typeof imagesToDelete === 'string' ? JSON.parse(imagesToDelete) : imagesToDelete;
                if (Array.isArray(ids) && ids.length > 0) {
                    // Lấy tên file trước khi xóa bản ghi
                    const [imagesInDb] = await pool.query("SELECT image FROM product_image WHERE id IN (?)", [ids]);
                    
                    await Product.deleteSpecificImages(ids); // Xóa trong DB

                    for (const img of imagesInDb) {
                        await deleteFile(img.image); // 🗑️ Xóa rác vật lý trong /uploads
                    }
                }
            } catch (e) { console.error("Lỗi xóa ảnh phụ:", e.message); }
        }

        // 🟢 5. THÊM ẢNH PHỤ MỚI (Cộng dồn)
        if (files && files['images']) {
            for (const file of files['images']) {
                await Product.addImage(id, file.filename);
            }
        }

        // 🟢 6. XỬ LÝ THUỘC TÍNH (ENGINEERING SPECS)
        if (attributesToUpdate !== undefined) {
            await Product.deleteAttributes(id);
            if (attributesToUpdate) {
                try {
                    const attrs = typeof attributesToUpdate === 'string' ? JSON.parse(attributesToUpdate) : attributesToUpdate;
                    if (Array.isArray(attrs)) {
                        for (const attr of attrs) {
                            await Product.addAttribute(id, attr.attribute_id, attr.value);
                        }
                    }
                } catch (e) { console.error("Lỗi attributes update:", e.message); }
            }
        }
    },

    destroy: async (id) => {
        // Dọn sạch album ảnh phụ (File + DB)
        const images = await Product.getImages(id);
        for (const img of images) { await deleteFile(img.image); }
        
        // Dọn thumbnail chính (File)
        const product = await Product.getById(id);
        if (product && product.thumbnail) { await deleteFile(product.thumbnail); }

        // Xóa sạch các ràng buộc trong DB
        await Product.deleteImages(id);
        await Product.deleteAttributes(id);
        return await Product.delete(id);
    },

    getAttributes: async () => {
        return await Attribute.getAll();
    },

    storeAttribute: async (data) => {
        return await Attribute.create(data);
    },

    updateAttribute: async (id, data) => {
        const affected = await Attribute.update(id, data);
        if (!affected) throw new Error('Không tìm thấy thuộc tính');
    },

    destroyAttribute: async (id) => {
        const affected = await Attribute.delete(id);
        if (!affected) throw new Error('Không tìm thấy thuộc tính');
    }
};

module.exports = productService;