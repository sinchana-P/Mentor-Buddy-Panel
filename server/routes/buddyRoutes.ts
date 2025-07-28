import express from 'express';
import {
  getAllBuddies,
  getBuddyById,
  createBuddy,
  updateBuddy,
  assignBuddyToMentor,
  getBuddyTasks,
  getBuddyProgress,
  updateBuddyProgress,
  getBuddyPortfolio
} from '../controllers/buddyController';

const router = express.Router();

// GET /api/buddies - Get all buddies
router.get('/', getAllBuddies);

// GET /api/buddies/:id - Get buddy by ID
router.get('/:id', getBuddyById);

// GET /api/buddies/:id/tasks - Get tasks for a buddy
router.get('/:id/tasks', getBuddyTasks);

// GET /api/buddies/:id/progress - Get progress for a buddy
router.get('/:id/progress', getBuddyProgress);

// GET /api/buddies/:id/portfolio - Get portfolio for a buddy
router.get('/:id/portfolio', getBuddyPortfolio);

// POST /api/buddies - Create a new buddy
router.post('/', createBuddy);

// PUT /api/buddies/:id - Update a buddy
router.put('/:id', updateBuddy);

// PUT /api/buddies/:id/assign - Assign buddy to mentor
router.put('/:id/assign', assignBuddyToMentor);

// PATCH /api/buddies/:buddyId/progress/:topicId - Update buddy progress for a topic
router.patch('/:buddyId/progress/:topicId', updateBuddyProgress);

export default router;