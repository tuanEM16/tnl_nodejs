const Post = require('../models/postModel');
const PostCategory = require('../models/postCategoryModel');
const { toSlug } = require('../utils/helpers');
const { deleteFile, extractImagesFromContent } = require('../utils/fileHelpers');
const PostImage = require('../models/postImageModel');
const db = require('../config/db');


const postService = {

    getCategories: async () => {
        return await PostCategory.getAll();
    },

    getCategoryById: async (id) => {
        return await PostCategory.getById(id);
    },

    storeCategory: async (data) => {
        let slug = data.slug || toSlug(data.name);
        let exists = await PostCategory.slugExists(slug);
        let counter = 1;
        let newSlug = slug;
        while (exists) {
            newSlug = `${slug}-${counter}`;
            exists = await PostCategory.slugExists(newSlug);
            counter++;
        }
        return await PostCategory.create({ ...data, slug: newSlug });
    },
    updateOrder: async (ids) => {
        // Chạy vòng lặp để cập nhật sort_order theo mảng ID gửi lên
        for (let i = 0; i < ids.length; i++) {
            await db.query(
                'UPDATE post SET sort_order = ? WHERE id = ?',
                [i, ids[i]]
            );
        }
        return true;
    },
    updateCategory: async (id, data) => {
        if (data.slug) {
            const exists = await PostCategory.slugExists(data.slug, id);
            if (exists) throw new Error('Slug danh mục đã tồn tại');
        }
        const affected = await PostCategory.update(id, data);
        if (!affected) throw new Error('Không tìm thấy danh mục');
    },

    destroyCategory: async (id) => {
        const affected = await PostCategory.delete(id);
        if (!affected) throw new Error('Không tìm thấy danh mục');
    },
    getPostByPageSlug: async (slug) => {
        const query = `
            SELECT p.* FROM post p
            JOIN post_page_category ppc ON p.page_category_id = ppc.id
            WHERE ppc.slug = ? 
            AND p.post_type = 'page' 
            AND p.status = 1
            ORDER BY p.sort_order ASC
        `;
        const [rows] = await db.query(query, [slug]);
        return rows; // Trả về mảng các bài viết thuộc Slot đó
    },
    index: async (filters) => {
        // Chỉ cần gọi Model Post.getAll là đủ. 
        // Vì trong Model má đã chỉ đại ca viết lệnh JOIN để bốc Tên Danh Mục rồi
        const rows = await Post.getAll(filters);

        return rows; // Trả về kết quả có đầy đủ category_name và page_category_name
    },

    show: async (id) => {
        return await Post.getById(id);
    },

    showBySlug: async (slug) => {
        return await Post.getBySlug(slug);
    },

    store: async (data, file) => {

        let slug = data.slug || toSlug(data.title);

        let exists = await Post.slugExists(slug);

        let counter = 1;

        let newSlug = slug;

        while (exists) {

            newSlug = `${slug}-${counter}`;

            exists = await Post.slugExists(newSlug);

            counter++;

        }

        const payload = { ...data, slug: newSlug };

        if (file) payload.image = file.filename;



        // 🟢 BƯỚC 1: Phải await để thằng DB nó tạo xong bài viết và nhả ID ra

        const postId = await Post.create(payload);



        if (!postId) {

            throw new Error("Lỗi hệ thống: Đéo bốc được Post ID mới!");

        }



        // 🟢 BƯỚC 3: Đồng bộ ảnh gallery (Dùng cái postId vừa bốc được)

        const contentImages = extractImagesFromContent(data.content);

        if (contentImages.length > 0) {

            // Phải có await ở đây để nó chạy xong mới trả kết quả về Controller

            await PostImage.bulkInsert(postId, contentImages);

        }



        return { insertId: postId };

    },

    // ✅ CẬP NHẬT — sync lại post_images khi edit
    update: async (id, data, file) => {
        const updateData = { ...data };
        delete updateData._method;

        if (file) {
            const oldPost = await Post.getById(id);
            if (oldPost && oldPost.image) await deleteFile(oldPost.image);
            updateData.image = file.filename;
        }

        if (updateData.slug) {
            const exists = await Post.slugExists(updateData.slug, id);
            if (exists) throw new Error('Slug đã tồn tại');
        }

        if (updateData.title && !updateData.slug) {
            let slug = toSlug(updateData.title);
            let exists = await Post.slugExists(slug, id);
            let counter = 1;
            let newSlug = slug;
            while (exists) {
                newSlug = `${slug}-${counter}`;
                exists = await Post.slugExists(newSlug, id);
                counter++;
            }
            updateData.slug = newSlug;
        }

        const affected = await Post.update(id, updateData);
        if (!affected) throw new Error('Không tìm thấy bài viết hoặc dữ liệu không đổi');

        // ✅ Sync post_images: xóa cũ → xóa file vật lý không còn dùng → insert mới
        if (updateData.content !== undefined) {
            const oldFilenames = await PostImage.deleteByPostId(id);
            const newFilenames = extractImagesFromContent(updateData.content);

            // Xóa file vật lý những ảnh không còn trong content
            const removed = oldFilenames.filter(f => !newFilenames.includes(f));
            for (const filename of removed) {
                await deleteFile(filename);
            }

            if (newFilenames.length) {
                await PostImage.bulkInsert(id, newFilenames);
            }
        }
    },

    // ✅ XÓA — dọn luôn ảnh content (CASCADE xóa DB, còn phải xóa file vật lý)
    destroy: async (id) => {
        const post = await Post.getById(id);

        // Xóa ảnh bìa
        if (post && post.image) await deleteFile(post.image);

        // Xóa ảnh nội dung vật lý
        const contentImages = await PostImage.deleteByPostId(id);
        for (const filename of contentImages) {
            await deleteFile(filename);
        }

        const [result] = await db.query('DELETE FROM post WHERE id = ?', [id]);
        if (result.affectedRows === 0) throw new Error('Không tìm thấy bài viết trong Database để xóa!');

        return true;
    },
getAboutSections: async () => {
        // Lấy dữ liệu thô từ Model
        const { sections, metas } = await Post.getAboutSections();

        // Xử lý logic gộp meta vào section ngay tại Service
        const formattedSections = sections.map(section => {
            const sectionMetas = metas.filter(m => m.section_id === section.id);
            const metaObject = {};
            
            sectionMetas.forEach(m => {
                try {
                    // Cố gắng parse JSON (dành cho các mảng như values, events)
                    metaObject[m.meta_key] = JSON.parse(m.meta_value);
                } catch (e) {
                    // Nếu là chuỗi string hoặc HTML bình thường thì giữ nguyên
                    metaObject[m.meta_key] = m.meta_value;
                }
            });

            return { ...section, meta: metaObject };
        });

        return formattedSections;
    },

    storeAboutSection: async (data, file) => {
        const { name, layout, sort_order, status, ...metaData } = data;
        const sectionData = { name, layout, sort_order, status };
        
        // Gắn tên file ảnh vào meta nếu có upload
        if (file) metaData.image = file.filename;

        // Gọi Model xử lý DB
        return await Post.createAboutSection(sectionData, metaData);
    },

    updateAboutSection: async (id, data, file) => {
        const { name, layout, sort_order, status, ...metaData } = data;
        const sectionData = { name, layout, sort_order, status };

        if (file) {
            // Xóa file vật lý ảnh cũ trước khi cập nhật ảnh mới
            const [oldImageRows] = await db.query('SELECT meta_value FROM about_section_meta WHERE section_id = ? AND meta_key = "image"', [id]);
            if (oldImageRows.length > 0 && oldImageRows[0].meta_value) {
                await deleteFile(oldImageRows[0].meta_value);
            }
            // Gắn tên file mới vào metaData
            metaData.image = file.filename;
        }

        // Gọi Model xử lý DB
        return await Post.updateAboutSection(id, sectionData, metaData);
    },

    destroyAboutSection: async (id) => {
        // Dọn dẹp file ảnh vật lý trước khi xóa khỏi DB
        const [oldImageRows] = await db.query('SELECT meta_value FROM about_section_meta WHERE section_id = ? AND meta_key = "image"', [id]);
        if (oldImageRows.length > 0 && oldImageRows[0].meta_value) {
            await deleteFile(oldImageRows[0].meta_value);
        }

        // Gọi Model xóa DB
        return await Post.destroyAboutSection(id);
    }
};

module.exports = postService;