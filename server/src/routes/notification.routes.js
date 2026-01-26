// notification.routes.js - Notification routes
import express from 'express';
import { getNotifications, markAsRead, deleteNotification, deleteAllNotifications } from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/read', protect, markAsRead);
router.delete('/all', protect, deleteAllNotifications);
router.delete('/:id', protect, deleteNotification);

export default router;

