import express from 'express';
import {
  login,
  register,
  getCurrentUser,
  updateUserRole
} from '../controllers/authController';

const router = express.Router();

// POST /api/auth/login - Login a user
router.post('/login', login);

// POST /api/auth/register - Register a new user
router.post('/register', register);

// GET /api/auth/me - Get current user
router.get('/me', getCurrentUser);

// PATCH /api/auth/role - Update user role
router.patch('/role', updateUserRole);

export default router;