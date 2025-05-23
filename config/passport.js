// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MediloungeUser = require('../models/userModel');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await MediloungeUser.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {

        // Add detailed logging
        console.log('Google Strategy Initialization:', {
            backendUrl: process.env.BACKEND_URL,
            hasClientId: !!process.env.GOOGLE_CLIENT_ID,
            hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: `${process.env.BACKEND_URL}/auth/google/callback`
        });
        
        console.log('Profile received:', {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName
        });


        console.log('OAuth callback received:', {
            accessToken: !!accessToken,
            profile: {
                id: profile.id,
                email: profile.emails[0].value
            }
        });
        console.log('Google profile:', profile);
        let user = await MediloungeUser.findOne({ googleId: profile.id });
        
        if (!user) {
            const email = profile.emails[0].value;
            // Check if email is from limitlessglobaltechnologies.com
            const isLimitlessEmail = email.endsWith('@limitlessglobaltechnologies.com');
            
            user = await MediloungeUser.create({
                googleId: profile.id,
                email: email,
                displayName: profile.displayName,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                profilePhoto: profile.photos[0].value,
                role: isLimitlessEmail ? 'admin' : null // Set role to admin for limitless emails
            });
        }
        
        done(null, user);
    } catch (error) {
        console.error('Google Strategy Error:', error);
        console.error('Google Strategy Error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        done(error);
    }
}));

module.exports = passport;