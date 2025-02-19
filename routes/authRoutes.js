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
        failureRedirect: 'http://localhost:3000/login?error=auth_failed',
        session: true
    }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            res.redirect(`http://localhost:3000/google-callback?token=${token}`);
        } catch (error) {
            console.error('Callback error:', error);
            res.redirect('http://localhost:3000/login?error=auth_failed');
        }
    }
);

module.exports = router;