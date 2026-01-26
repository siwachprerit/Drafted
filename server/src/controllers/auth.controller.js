// auth.controller.js - Authentication controller
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'This email id has an existing account' });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username not available' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
        });

        // Return user data with token
        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier can be email or username

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Incorrect details' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect details' });
        }

        // Return user data with token
        res.status(200).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, username, password, profilePicture } = req.body;

        // Check Username Uniqueness
        if (username && username !== user.username) {
            const userExists = await User.findOne({ username });
            if (userExists && userExists._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        // Check Email Uniqueness
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'Email already taken' });
            }
            user.email = email;
        }

        // Update Name
        if (name) {
            user.name = name;
        }

        // Update Password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Update Profile Picture
        if (profilePicture !== undefined) {
            user.profilePicture = profilePicture;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error('Update profile error:', error);
        // Handle Mongoose duplicate key error specifically
        if (error.code === 11000) {
            if (error.keyPattern.username) return res.status(400).json({ message: 'Username already taken' });
            if (error.keyPattern.email) return res.status(400).json({ message: 'Email already taken' });
        }
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cascade delete: Delete all blogs by this user
        await Blog.deleteMany({ author: user._id });

        // Delete user
        await user.deleteOne();

        res.status(200).json({ message: 'Account and related data deleted' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
