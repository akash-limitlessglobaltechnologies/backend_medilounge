const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../utils/generateToken');

router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
        session: true
    }),
    async (req, res) => {
        try {
            if (!req.user) {
                throw new Error('Authentication failed');
            }
            const token = generateToken(req.user);
            res.redirect(`${process.env.FRONTEND_URL}/google-callback?token=${token}`);
        } catch (error) {
            console.error('Callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`);
        }
    }
);

module.exports = router;