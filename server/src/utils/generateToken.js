// generateToken.js - JWT token generation utility
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

export default generateToken;
