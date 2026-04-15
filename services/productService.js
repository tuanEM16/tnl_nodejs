const Product = require('../models/productModel');
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
        product.sale = await Product.getCurrentSale(id);
        product.store = await Product.getStore(id);
        product.related = await Product.getRelated(product.category_id, id);
        return product;
    },
    showBySlug: async (slug) => {
        const product = await Product.getBySlug(slug);
        if (!product) return null;
        const id = product.id;
        product.images = await Product.getImages(id);
        product.attributes = await Product.getAttributes(id);
        product.sale = await Product.getCurrentSale(id);
        product.store = await Product.getStore(id);
        product.related = await Product.getRelated(product.category_id, id);
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
            thumbnail: data.thumbnail || (files && files.thumbnail ? files.thumbnail[0].filename : ''),
            content: data.content,
            description: data.description,
            price_buy: data.price_buy,
            created_by: data.created_by
        };
        const productId = await Product.create(productData);
        if (files && files.images) {
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
        if (data.qty !== undefined) {
            await Product.updateStore(productId, data.price_root || data.price_buy, data.qty);
        }
        return productId;
    },
    update: async (id, data, files) => {
        if (data.slug) {
            const exists = await Product.slugExists(data.slug, id);
            if (exists) throw new Error('Slug đã tồn tại');
        }
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
        if (files && files.thumbnail) {
            data.thumbnail = files.thumbnail[0].filename;
        }
        const affected = await Product.update(id, data);
        if (!affected) throw new Error('Không tìm thấy sản phẩm');
        if (files && files.images && files.images.length > 0) {
            await Product.deleteImages(id);
            for (const file of files.images) {
                await Product.addImage(id, file.filename);
            }
        }
        if (data.attributes !== undefined) {
            await Product.deleteAttributes(id);
            if (data.attributes) {
                const attrs = JSON.parse(data.attributes);
                for (const attr of attrs) {
                    await Product.addAttribute(id, attr.attribute_id, attr.value);
                }
            }
        }
        if (data.qty !== undefined) {
            await Product.updateStore(id, data.price_root || data.price_buy, data.qty);
        }
    },
    destroy: async (id) => {
        const affected = await Product.delete(id);
        if (!affected) throw new Error('Không tìm thấy sản phẩm');
    }
};
module.exports = productService;