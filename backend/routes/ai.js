import express from 'express';
import {
  chatWithHelper,
  getWageRecommendation,
  getJobMatchingScore,
  getCareerAdvice
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, chatWithHelper);
router.post('/wage-recommendation', protect, getWageRecommendation);
router.post('/job-matching', protect, getJobMatchingScore);
router.get('/career-advice', protect, authorize('worker'), getCareerAdvice);

export default router;
