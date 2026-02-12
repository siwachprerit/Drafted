// blog.routes.js - Blog routes
import express from 'express';
import {
    createBlog,
    getAllBlogs,
    getMyBlogs,
    getBlogById,
    getBlogForEdit,
    updateBlog,
    deleteBlog,
    likeBlog,
    addComment,
    toggleSaveBlog,
    getSavedBlogs,
    deleteComment,
    incrementView,
    getTags,
    getRelatedBlogs
} from '../controllers/blog.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/blogs (protected)
router.post('/', protect, createBlog);

// GET /api/blogs
router.get('/', getAllBlogs);

// GET /api/blogs/tags
router.get('/tags', getTags);

// GET /api/blogs/my (protected)
router.get('/my', protect, getMyBlogs);

// GET /api/blogs/saved (protected)
router.get('/saved', protect, getSavedBlogs);

// GET /api/blogs/:id/related
router.get('/:id/related', getRelatedBlogs);

// GET /api/blogs/:id
router.get('/:id', getBlogById);

// POST /api/blogs/:id/view (public)
router.post('/:id/view', incrementView);

// GET /api/blogs/:id/edit (protected)
router.get('/:id/edit', protect, getBlogForEdit);

// PUT /api/blogs/:id (protected)
router.put('/:id', protect, updateBlog);

// DELETE /api/blogs/:id (protected)
router.delete('/:id', protect, deleteBlog);

// SOCIAL ROUTES
// POST /api/blogs/:id/like (protected)
router.post('/:id/like', protect, likeBlog);

// POST /api/blogs/:id/comment (protected)
router.post('/:id/comment', protect, addComment);

// DELETE /api/blogs/:id/comment/:commentId (protected)
router.delete('/:id/comment/:commentId', protect, deleteComment);

// POST /api/blogs/:id/save (protected)
router.post('/:id/save', protect, toggleSaveBlog);

export default router;
