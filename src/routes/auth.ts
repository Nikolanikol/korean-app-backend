import express from 'express';
import passport from '../config/passport.js';
import { handleGoogleCallback } from '../controllers/authController.js';

const router = express.Router();

// GET /auth/google - начало OAuth flow
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// GET /auth/google/callback - redirect после Google
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/auth/google/failure'
  }),
  handleGoogleCallback
);

// Fallback для неудачной авторизации
router.get('/google/failure', (req, res) => {
  console.error('❌ OAuth Flow Failed: User redirected to failure endpoint');
  
  res.status(401).json({ 
    error: {
      message: 'Google authentication failed',
      code: 'OAUTH_FAILURE',
      details: 'User may have denied access or authentication was cancelled',
      action: 'Please try logging in again'
    }
  });
});

export default router;