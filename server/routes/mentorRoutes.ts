import express from 'express';
import {
  getAllMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
  getMentorBuddies
} from '../controllers/mentorController';

const router = express.Router();

// GET /api/mentors - Get all mentors
router.get('/', getAllMentors);

// GET /api/mentors/:id - Get mentor by ID
router.get('/:id', getMentorById);

// GET /api/mentors/:id/buddies - Get buddies for a mentor
router.get('/:id/buddies', getMentorBuddies);

// POST /api/mentors - Create a new mentor
router.post('/', createMentor);

// PUT /api/mentors/:id - Update a mentor
router.put('/:id', updateMentor);

// PATCH /api/mentors/:id - Update a mentor (alternative method)
router.patch('/:id', updateMentor);

// DELETE /api/mentors/:id - Delete a mentor
router.delete('/:id', deleteMentor);

export default router;