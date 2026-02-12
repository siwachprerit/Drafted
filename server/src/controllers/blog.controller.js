// blog.controller.js - Blog controller
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socketio.js';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';


export const createBlog = async (req, res) => {
    try {
        const { title, content, tags, isPublished, coverImage } = req.body;

        const slug = `${title.toLowerCase().trim().replace(/[\s\W-]+/g, '-')}-${nanoid(6)}`;

        const blog = await Blog.create({
            title,
            slug,
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
        const { author, search } = req.query;
        let query = { isPublished: true };

        if (author) {
            query.author = author;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { content: searchRegex },
                { tags: { $in: [searchRegex] } }
            ];
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email profilePicture');

        const total = await Blog.countDocuments(query);

        res.status(200).json({
            blogs,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBlogs: total
        });
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

        let blog;
        if (mongoose.Types.ObjectId.isValid(id)) {
            blog = await Blog.findById(id)
                .populate('author', 'name email profilePicture')
                .populate('comments.user', 'name profilePicture');
        } else {
            blog = await Blog.findOne({ slug: id })
                .populate('author', 'name email profilePicture')
                .populate('comments.user', 'name profilePicture');
        }

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
                await notification.populate('blog', 'title slug');
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
        const { content, parentId } = req.body;
        const userId = req.user._id;

        if (!content) return res.status(400).json({ message: 'Comment content is required' });

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.comments.push({
            user: userId,
            content,
            parentId: parentId || null
        });

        await blog.save();

        // Create Notification
        const newComment = blog.comments[blog.comments.length - 1]; // Get the comment we just added

        // Notify Blog Author (if not self)
        if (blog.author.toString() !== userId.toString() && !parentId) {
            const notification = await Notification.create({
                recipient: blog.author,
                sender: userId,
                type: 'comment',
                blog: id,
                content: content.substring(0, 50),
            });
            await notification.populate('sender', 'name profilePicture');
            await notification.populate('blog', 'title slug');
            emitToUser(blog.author, 'new_notification', notification);
        }

        // Notify Parent Comment Author (if reply)
        if (parentId) {
            const parentComment = blog.comments.id(parentId);
            if (parentComment && parentComment.user.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    recipient: parentComment.user,
                    sender: userId,
                    type: 'comment', // Keeping logic simple, or 'reply' if schema supports
                    blog: id,
                    content: content.substring(0, 50),
                });
                await notification.populate('sender', 'name profilePicture');
                await notification.populate('blog', 'title slug');
                emitToUser(parentComment.user, 'new_notification', notification);
            }
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

export const deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const userId = req.user._id;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Find comment
        const comment = blog.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check permission: Comment author OR Blog author can delete
        if (comment.user.toString() !== userId.toString() && blog.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Remove the notification associated with this comment
        // We assume the notification was created with content substring(0, 50)
        // We match by sender, recipient (blog author), type, blog, and content substring
        try {
            if (blog.author.toString() !== comment.user.toString()) {
                const notification = await Notification.findOneAndDelete({
                    recipient: blog.author,
                    sender: comment.user,
                    type: 'comment',
                    blog: id,
                    content: comment.content.substring(0, 50)
                });

                if (notification) {
                    emitToUser(blog.author, 'remove_notification', notification._id);
                }
            }
        } catch (notifError) {
            console.error('[DELETE COMMENT] Failed to remove notification:', notifError);
            // Continue deletion of comment even if notification removal fails
        }

        // Remove comment
        blog.comments.pull(commentId);
        await blog.save();

        res.status(200).json(blog.comments);
    } catch (error) {
        console.error('[DELETE COMMENT] Controller crashed:', error);
        res.status(500).json({ message: 'Server error deleting comment' });
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

export const incrementView = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json({ views: blog.views });
    } catch (error) {
        console.error('[VIEW] Controller crashed:', error);
        res.status(500).json({ message: 'Server error incrementing view' });
    }
};

export const getTags = async (req, res) => {
    try {
        const tags = await Blog.aggregate([
            { $match: { isPublished: true } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.status(200).json(tags);
    } catch (error) {
        console.error('[TAGS] Controller crashed:', error);
        res.status(500).json({ message: 'Server error fetching tags' });
    }
};
