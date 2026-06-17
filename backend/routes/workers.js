import express from 'express';
import {
  createOrUpdateWorkerProfile,
  getWorkers,
  getWorkerById,
  getMyWorkerProfile,
  uploadAvatar
} from '../controllers/workerController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getWorkers);
router.get('/my-profile', protect, authorize('worker'), getMyWorkerProfile);
router.get('/:id', getWorkerById);
router.post('/profile', protect, authorize('worker'), createOrUpdateWorkerProfile);
router.post('/upload-avatar', protect, authorize('worker'), upload.single('image'), uploadAvatar);

export default router;
