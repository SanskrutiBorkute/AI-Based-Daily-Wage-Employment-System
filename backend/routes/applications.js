import express from 'express';
import {
  applyJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  rateWorker
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/apply', protect, authorize('worker'), applyJob);
router.get('/my-applications', protect, authorize('worker'), getMyApplications);
router.get('/job-applicants/:jobId', protect, authorize('employer'), getJobApplicants);
router.patch('/:id', protect, authorize('employer'), updateApplicationStatus);
router.post('/:id/rate', protect, authorize('employer'), rateWorker);

export default router;
