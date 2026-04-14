const productModel = require('../models/productModel');
const db = require('../config/db'); 

const productService = {
    getHomeProducts: async () => {
        try {

            const products = await productModel.getAllWithDetails(); 
            
            return products.map(item => ({
                ...item,
                is_out_of_stock: item.qty <= 0, 

                final_price: item.price_sale && item.is_sale_active ? item.price_sale : item.price_buy
            }));
        } catch (error) {
            throw new Error("Lỗi xử lý nghiệp vụ sản phẩm: " + error.message);
        }
    },

    createNewProduct: async (data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();


            const productId = await productModel.insert(data, connection);


            await productModel.insertStore(productId, data.price_root, data.qty, connection);


            if (data.images && data.images.length > 0) {
                await productModel.insertImages(productId, data.images, connection);
            }

            await connection.commit();
            return { id: productId, status: 'Success' };
        } catch (error) {
            await connection.rollback(); 
            throw error;
        } finally {
            connection.release(); 
        }
    }
};

module.exports = productService;