import express from 'express';
import {
  getStats,
  getAllUsers,
  deleteUser,
  deleteJobByAdmin
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.delete('/jobs/:id', deleteJobByAdmin);

export default router;
