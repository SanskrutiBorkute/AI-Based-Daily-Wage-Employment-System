import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Employer from '../models/Employer.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await Worker.countDocuments();
    const totalEmployers = await Employer.countDocuments();
    const totalJobs = await Job.countDocuments();

    return res.json({
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the currently logged-in admin
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    // Cascade delete depending on role
    if (user.role === 'worker') {
      const worker = await Worker.findOne({ userId: user._id });
      if (worker) {
        await Application.deleteMany({ workerId: worker._id });
        await Worker.findByIdAndDelete(worker._id);
      }
    } else if (user.role === 'employer') {
      const employer = await Employer.findOne({ userId: user._id });
      if (employer) {
        const jobs = await Job.find({ employerId: employer._id });
        const jobIds = jobs.map(j => j._id);
        await Application.deleteMany({ jobId: { $in: jobIds } });
        await Job.deleteMany({ employerId: employer._id });
        await Employer.findByIdAndDelete(employer._id);
      }
    }

    await User.findByIdAndDelete(user._id);
    return res.json({ message: 'User and all associated data deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteJobByAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await Application.deleteMany({ jobId: job._id });
    await Job.findByIdAndDelete(job._id);

    return res.json({ message: 'Job moderated and deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
