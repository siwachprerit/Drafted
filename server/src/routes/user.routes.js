// user.routes.js - User routes
import express from 'express';
import { followUser, getUserProfile, getUserFollowers, getUserFollowing, updateProfile } from '../controllers/user.controller.js';
import { protect, optionalProtect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /api/users/:userId/follow (protected)
router.post('/:userId/follow', protect, followUser);

// GET /api/users/:userId (public, but includes follow status if authenticated)
router.get('/:userId', optionalProtect, getUserProfile);

// GET /api/users/:userId/followers
router.get('/:userId/followers', getUserFollowers);

// GET /api/users/:userId/following (includes follow status if authenticated)
router.get('/:userId/following', optionalProtect, getUserFollowing);

// PUT /api/users/profile (protected)
router.put('/profile', protect, updateProfile);

export default router;
