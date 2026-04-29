const postService = require('../services/postService');
const db = require('../config/db');
const postController = {

    getCategories: async (req, res) => {
        try {
            const data = await postService.getCategories();
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    storeCategory: async (req, res) => {
        try {
            const id = await postService.storeCategory(req.body);
            res.status(201).json({ success: true, message: 'Thêm danh mục thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateCategory: async (req, res) => {
        try {
            await postService.updateCategory(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    updateOrder: async (req, res) => {
        try {
            const { ids } = req.body;

            if (!ids || !Array.isArray(ids)) {
                return res.status(400).json({ success: true, message: "Dữ liệu không hợp lệ!" });
            }

            // 🟢 ĐẨY XỬ LÝ SANG SERVICE (Giống các hàm khác của đại ca)
            await postService.updateOrder(ids);

            res.json({ success: true, message: "Đã chốt vị trí thép thành công!" });
        } catch (error) {
            console.error("❌ LỖI REORDER:", error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // Thêm hàm này vào controller
    getPageCategories: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM post_page_category WHERE status = 1');
            res.json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    destroyCategory: async (req, res) => {
        try {
            await postService.destroyCategory(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    index: async (req, res) => {
        try {
            const filters = {
                post_type: req.query.post_type,
                page_slug: req.query.page_slug,
                category_id: req.query.category_id,
                keyword: req.query.keyword,
                page_category_id: req.query.page_category_id,
                limit: req.query.limit || 20,
                offset: req.query.offset || 0
            };
            const data = await postService.index(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // controllers/postController.js

    storePageCategory: async (req, res) => {
        try {
            const { name } = req.body;
            // Tự tạo slug sạch sẽ để FE gọi cho sướng
            const slug = name.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');

            // 🔴 Đẩy vào đúng bảng post_page_category
            const [result] = await db.query(
                'INSERT INTO post_page_category (name, slug, status) VALUES (?, ?, 1)',
                [name, slug]
            );

            res.status(201).json({ success: true, message: 'ĐÃ THÊM VỊ TRÍ MỚI', id: result.insertId });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // 🟢 Tiêu hủy danh mục trang tĩnh
    destroyPageCategory: async (req, res) => {
        try {
            await db.query('DELETE FROM post_page_category WHERE id = ?', [req.params.id]);
            res.json({ success: true, message: 'ĐÃ XÓA VỊ TRÍ' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // be_nodejs/controllers/postController.js

    store: async (req, res) => {
        try {
            // 🟢 CHỈNH LẠI: Truyền thẳng body và file sang Service xử lý cho đồng bộ
            const result = await postService.store(req.body, req.file);

            res.status(201).json({
                success: true,
                message: 'Đã chốt bài viết mới thành công!',
                id: result.insertId
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    show: async (req, res) => {
        try {
            const data = await postService.show(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    showBySlug: async (req, res) => {
        try {
            const data = await postService.showBySlug(req.params.slug);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    update: async (req, res) => {
        try {
            console.log('===== UPDATE POST =====');
            console.log('req.params.id:', req.params.id);
            console.log('req.file:', req.file);           // Phải có object chứa filename
            console.log('req.body:', req.body);
            const { id } = req.params;
            const payload = { ...req.body };

            if (req.file) {
                payload.image = req.file.filename;
            }


            if (payload.image && typeof payload.image !== 'string') {
                delete payload.image;
            }


            const updateData = { ...req.body };
            // 🟢 Truyền thêm req.file vào tham số thứ 3
            await postService.update(req.params.id, updateData, req.file);

            res.status(200).json({ success: true, message: 'Cập nhật bài viết thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    destroy: async (req, res) => {
        try {
            await postService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa bài viết thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    uploadContentImage: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ success: false, message: 'Đéo thấy file đâu!' });

            res.json({ filename: req.file.filename });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};

module.exports = postController;