// auth.routes.js - Authentication routes
import express from 'express';
import { registerUser, loginUser, getMe, updateProfile, deleteAccount } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/me (protected)
router.get('/me', protect, getMe);

// PUT /api/auth/profile (protected)
// PUT /api/auth/profile (protected)
router.put('/profile', protect, updateProfile);

// DELETE /api/auth/me (protected)
router.delete('/me', protect, deleteAccount);

export default router;
