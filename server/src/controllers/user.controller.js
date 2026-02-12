// user.controller.js - User controller
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Blog from '../models/Blog.js';
import { emitToUser } from '../config/socketio.js';

export const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userToFollow._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const isFollowing = currentUser.following.includes(userToFollow._id);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());

            // Find and delete the follow notification
            const notification = await Notification.findOneAndDelete({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow'
            });

            if (notification) {
                emitToUser(userToFollow._id, 'remove_notification', notification._id);
            }

        } else {
            // Follow
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);

            // Create follow notification
            const notification = new Notification({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow'
            });
            await notification.save();

            // Emit real-time notification
            await notification.populate('sender', 'name profilePicture');
            emitToUser(userToFollow._id, 'new_notification', notification);
        }

        await currentUser.save();
        await userToFollow.save();

        res.status(200).json({ isFollowing: !isFollowing });

    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const blogs = await Blog.find({ author: user._id, isPublished: true })
            .sort({ createdAt: -1 })
            .populate('author', 'name email profilePicture');

        // Check if current user is following this user
        let isFollowing = false;
        if (req.user) { // Assuming auth middleware attaches user if token exists, or we might need to check header manually if endpoint is public-ish
            // However, route says public, but we need to know if *current* user follows them.
            // If the route is totally public (no auth middleware), req.user might be undefined.
            // If we want follow status, we need to know who is asking.
            // For now, let's assume if req.user exists we check.
            const currentUser = await User.findById(req.user._id);
            if (currentUser) {
                isFollowing = currentUser.following.includes(user._id);
            }
        }

        res.status(200).json({ user: { ...user.toObject(), isFollowing }, blogs });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        // Simple suggestion: users not already followed by current user
        const currentUser = await User.findById(req.user._id);

        const suggestions = await User.find({
            _id: { $ne: req.user._id, $nin: currentUser.following }
        })
            .limit(5)
            .select('name username profilePicture');

        res.status(200).json(suggestions);
    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('followers', 'name username profilePicture');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.followers);
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('following', 'name username profilePicture');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let followingWithStatus = user.following;

        // If authenticated, check if current user is following these users
        if (req.user) {
            const currentUser = await User.findById(req.user._id);
            if (currentUser) {
                followingWithStatus = user.following.map(followedUser => ({
                    ...followedUser.toObject(),
                    isFollowing: currentUser.following.includes(followedUser._id)
                }));
            }
        }

        res.status(200).json(followingWithStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, bio, profilePicture, coverImage, socialLinks } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (profilePicture) user.profilePicture = profilePicture;
        if (coverImage) user.coverImage = coverImage;
        if (socialLinks) {
            user.socialLinks = {
                ...user.socialLinks,
                ...socialLinks
            };
        }

        await user.save();

        // Return without password
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json(userObj);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
