import express from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// ... existing storage/upload config ...
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
router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        console.log('Starting Cloudinary upload stream...');

        // Use upload_stream for better performance and reliability
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'drafted',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return res.status(500).json({
                        message: 'Image upload failed',
                        error: error.message
                    });
                }
                console.log('Cloudinary upload success:', result.secure_url);
                res.status(200).json({
                    message: 'Image uploaded successfully',
                    imageUrl: result.secure_url
                });
            }
        );

        // Convert buffer to stream
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);

    } catch (error) {
        console.error('Upload route error:', error);
        res.status(500).json({
            message: 'Image upload failed',
            error: error.message
        });
    }
});

export default router;
