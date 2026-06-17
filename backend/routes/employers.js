import express from 'express';
import {
  createOrUpdateEmployerProfile,
  getMyEmployerProfile
} from '../controllers/employerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-profile', protect, authorize('employer'), getMyEmployerProfile);
router.post('/profile', protect, authorize('employer'), createOrUpdateEmployerProfile);

export default router;
