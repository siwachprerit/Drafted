// upload.routes.js - Image upload route with Cloudinary
import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed!'));
    }
});

// Upload to Cloudinary
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        // Convert buffer to base64 data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'drafted',
            resource_type: 'image',
        });

        res.status(200).json({
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            message: 'Image upload failed',
            error: error.message
        });
    }
});

export default router;
