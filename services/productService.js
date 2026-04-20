const Product = require('../models/productModel');
const Attribute = require('../models/attributeModel');
const { toSlug } = require('../utils/helpers');

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
            created_by: data.created_by
        };

        const productId = await Product.create(productData);

        if (files?.images) {
            for (const file of files.images) {
                await Product.addImage(productId, file.filename);
            }
        }

        if (data.attributes) {
            const attrs = JSON.parse(data.attributes);
            for (const attr of attrs) {
                await Product.addAttribute(productId, attr.attribute_id, attr.value);
            }
        }

        return productId;
    },

    update: async (id, data, files) => {

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
        delete updateData._method; // Xóa method spoofing
        const attributesToUpdate = updateData.attributes; // Tách attributes ra
        delete updateData.attributes; 

        if (files?.thumbnail) {
            updateData.thumbnail = files.thumbnail[0].filename;
        }


        const affected = await Product.update(id, updateData);
        if (!affected) throw new Error('Không tìm thấy sản phẩm');


        if (files?.images) {
            await Product.deleteImages(id);
            for (const file of files.images) {
                await Product.addImage(id, file.filename);
            }
        }


        if (attributesToUpdate !== undefined) {
            await Product.deleteAttributes(id);
            if (attributesToUpdate) {
                const attrs = typeof attributesToUpdate === 'string' 
                    ? JSON.parse(attributesToUpdate) 
                    : attributesToUpdate;
                for (const attr of attrs) {
                    await Product.addAttribute(id, attr.attribute_id, attr.value);
                }
            }
        }
    },


    destroy: async (id) => {


        await Product.deleteImages(id);
        

        await Product.deleteAttributes(id);
        

        const affected = await Product.delete(id);
        if (!affected) throw new Error('Xóa sản phẩm thất bại');
        return affected;
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