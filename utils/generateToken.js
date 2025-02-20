const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
            profilePhoto: user.profilePhoto,
            firstName: user.firstName,
            lastName: user.lastName
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Auth Header:', req.headers.authorization);
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded user in middleware:', decoded); // Add this log
        
        // Convert string ID to ObjectId format if needed
        req.user = {
            ...decoded,
            id: decoded.id // This should match the ID format in your token
        };
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { generateToken, authMiddleware };