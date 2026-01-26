// blog.controller.js - Blog controller
import Blog from '../models/Blog.js';
import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socketio.js';

export const createBlog = async (req, res) => {
    try {
        const { title, content, tags, isPublished, coverImage } = req.body;

        const blog = await Blog.create({
            title,
            content,
            tags: tags || [],
            coverImage: coverImage || undefined, // Use schema default if undefined
            isPublished: isPublished || false,
            author: req.user._id,
        });

        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const { author } = req.query;
        const query = { isPublished: true };
        if (author) query.author = author;

        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'name email profilePicture');

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user._id })
            .sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id)
            .populate('author', 'name email profilePicture')
            .populate('comments.user', 'name profilePicture');

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // If not published, only allow author to view
        if (!blog.isPublished) {
            // Check if user is authenticated and is the author
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(404).json({ message: 'Blog not found' });
            }

            try {
                const jwt = await import('jsonwebtoken');
                const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
                if (decoded.id !== blog.author._id.toString()) {
                    return res.status(404).json({ message: 'Blog not found' });
                }
            } catch (err) {
                return res.status(404).json({ message: 'Blog not found' });
            }
        }

        // Check follow status if logged in
        let isFollowing = false;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const jwt = await import('jsonwebtoken');
                const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
                const currentUser = await User.findById(decoded.id);
                if (currentUser) {
                    isFollowing = currentUser.following.includes(blog.author?._id || blog.author);
                }
            } catch (err) {
                // Ignore auth errors for follow status
            }
        }

        res.status(200).json({
            ...blog.toObject(),
            isFollowing
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getBlogForEdit = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update allowed fields
        const { title, content, tags, isPublished, coverImage } = req.body;
        if (title !== undefined) blog.title = title;
        if (content !== undefined) blog.content = content;
        if (tags !== undefined) blog.tags = tags;
        if (coverImage !== undefined) blog.coverImage = coverImage;
        if (isPublished !== undefined) blog.isPublished = isPublished;
        blog.updatedAt = Date.now();

        await blog.save();

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Blog.findByIdAndDelete(id);

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const isLiked = blog.likes.some(likeId => likeId.toString() === userId.toString());

        if (isLiked) {
            blog.likes.pull(userId);

            // Remove notification if it exists
            const notification = await Notification.findOneAndDelete({
                recipient: blog.author,
                sender: userId,
                type: 'like',
                blog: id
            });

            if (notification) {
                emitToUser(blog.author, 'remove_notification', notification._id);
            }
        } else {
            blog.likes.push(userId);
            // Create Notification
            if (blog.author.toString() !== userId.toString()) {
                console.log(`[NOTIF] Creating like notification for ${blog.author} from ${userId}`);
                const notification = await Notification.create({
                    recipient: blog.author,
                    sender: userId,
                    type: 'like',
                    blog: id,
                });
                // Populate and emit real-time notification
                await notification.populate('sender', 'name profilePicture');
                await notification.populate('blog', 'title');
                emitToUser(blog.author, 'new_notification', notification);
            } else {
                console.log(`[NOTIF] Self-like detected, skipping notification for ${userId}`);
            }
        }

        await blog.save();
        res.status(200).json(blog.likes);
    } catch (error) {
        console.error('[LIKE] Controller crashed:', error);
        res.status(500).json({ message: 'Server error during like' });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content) return res.status(400).json({ message: 'Comment content is required' });

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.comments.push({
            user: userId,
            content
        });

        await blog.save();

        // Create Notification
        if (blog.author.toString() !== userId.toString()) {
            const notification = await Notification.create({
                recipient: blog.author,
                sender: userId,
                type: 'comment',
                blog: id,
                content: content.substring(0, 50),
            });
            // Populate and emit real-time notification
            await notification.populate('sender', 'name profilePicture');
            await notification.populate('blog', 'title');
            emitToUser(blog.author, 'new_notification', notification);
        }

        const updatedBlog = await Blog.findById(id).populate('comments.user', 'name profilePicture');
        if (!updatedBlog) {
            return res.status(500).json({ message: 'Server state error' });
        }

        res.status(201).json(updatedBlog.comments);
    } catch (error) {
        console.error('[COMMENT] Controller crashed:', error);
        res.status(500).json({ message: 'Server error during comment' });
    }
};

export const toggleSaveBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const user = await import('../models/User.js').then(m => m.default.findById(userId));

        const isSaved = user.savedBlogs.includes(id);

        if (isSaved) {
            user.savedBlogs.pull(id);
        } else {
            user.savedBlogs.push(id);
        }

        await user.save();

        res.status(200).json({ isSaved: !isSaved });
    } catch (error) {
        console.error('[SAVE] Controller crashed:', error);
        res.status(500).json({ message: 'Server error during save' });
    }
};

export const getSavedBlogs = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await import('../models/User.js').then(m => m.default.findById(userId).populate({
            path: 'savedBlogs',
            populate: { path: 'author', select: 'name email profilePicture' }
        }));

        res.status(200).json(user.savedBlogs);
    } catch (error) {
        console.error('[GET SAVED] Controller crashed:', error);
        res.status(500).json({ message: 'Server error fetching saved blogs' });
    }
};
