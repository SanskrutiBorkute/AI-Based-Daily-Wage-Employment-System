import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Worker from '../models/Worker.js';
import Employer from '../models/Employer.js';
import Notification from '../models/Notification.js';

export const applyJob = async (req, res) => {
  const { jobId } = req.body;
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(400).json({ message: 'Please create a worker profile before applying' });
    }

    const job = await Job.findById(jobId).populate({
      path: 'employerId',
      populate: { path: 'userId', select: '_id' }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const alreadyApplied = await Application.findOne({ jobId, workerId: worker._id });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      jobId,
      workerId: worker._id,
      employerId: job.employerId._id
    });

    // Create notification for Employer
    if (job.employerId && job.employerId.userId) {
      await Notification.create({
        userId: job.employerId.userId._id,
        title: 'New Job Application 👷',
        message: `${worker.name} applied for "${job.title}"`,
        type: 'application'
      });
    }

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(400).json({ message: 'Worker profile not found' });
    }

    const applications = await Application.find({ workerId: worker._id })
      .populate({
        path: 'jobId',
        populate: { path: 'employerId', select: 'name phone' }
      })
      .sort({ createdAt: -1 });

    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) {
      return res.status(400).json({ message: 'Employer profile not found' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view applicants for this job' });
    }

    const applicants = await Application.find({ jobId: req.params.jobId })
      .populate('workerId')
      .sort({ createdAt: -1 });

    return res.json(applicants);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  try {
   if (!['accepted', 'completed', 'rejected'].includes(status)) {
  return res.status(400).json({ message: 'Invalid status value' });
}

    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) {
      return res.status(400).json({ message: 'Employer profile not found' });
    }

    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate({
        path: 'workerId',
        populate: { path: 'userId', select: '_id' }
      });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Create notification for Worker
    if (application.workerId && application.workerId.userId) {
      const statusEmoji = status === 'accepted' ? '🎉' : '❌';
      await Notification.create({
        userId: application.workerId.userId._id,
        title: `Application Update ${statusEmoji}`,
        message: `Your application for "${application.jobId.title}" has been ${status}`,
        type: 'application'
      });
    }

    // Update worker jobs count if accepted
    if (status === 'completed') {
  await Worker.findByIdAndUpdate(application.workerId._id, {
    $inc: { jobsCount: 1 }
  });
}

    return res.json(application);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const rateWorker = async (req, res) => {
  const { rating, review } = req.body;

  try {
    const employer = await Employer.findOne({ userId: req.user._id });

    if (!employer) {
      return res.status(400).json({
        message: 'Employer profile not found'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('workerId');

    if (!application) {
      return res.status(404).json({
        message: 'Application not found'
      });
    }

    if (application.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized'
      });
    }

    if (application.status !== 'completed') {
      return res.status(400).json({
        message: 'Job must be completed before rating'
      });
    }

    if (application.rating) {
      return res.status(400).json({
        message: 'Worker already rated'
      });
    }

    application.rating = rating;
    application.review = review || '';

    await application.save();

    const worker = application.workerId;

    const totalRatings = worker.totalRatings || 0;
    const currentRating = worker.rating || 5;

    const newAverage =
      ((currentRating * totalRatings) + rating) /
      (totalRatings + 1);

    worker.rating = Number(newAverage.toFixed(1));
    worker.totalRatings = totalRatings + 1;

    await worker.save();

    return res.json({
      message: 'Rating submitted successfully',
      workerRating: worker.rating
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
