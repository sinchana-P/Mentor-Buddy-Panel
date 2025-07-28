import { Router } from 'express';
import {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resourceController';

const router = Router();

// GET /api/resources - Get all resources
router.get('/', getAllResources);

// GET /api/resources/:id - Get resource by ID
router.get('/:id', getResourceById);

// POST /api/resources - Create a new resource
router.post('/', createResource);

// PATCH /api/resources/:id - Update a resource
router.patch('/:id', updateResource);

// DELETE /api/resources/:id - Delete a resource
router.delete('/:id', deleteResource);

export default router;