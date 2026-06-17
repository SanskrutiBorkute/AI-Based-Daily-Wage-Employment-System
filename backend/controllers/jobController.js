import Job from '../models/Job.js';
import Employer from '../models/Employer.js';
import Worker from '../models/Worker.js';
import { calculateMatchScore } from '../utils/matchScore.js';

export const createJob = async (req, res) => {
  const { title, trade, description, locationName, latitude, longitude, wage, phone, urgent } = req.body;
  try {
    if (!title || !trade || !description || !locationName || !wage || !phone) {
      return res.status(400).json({ message: 'Please fill all required job details' });
    }

    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) {
      return res.status(400).json({ message: 'Please complete your employer profile before posting a job' });
    }

    const lat = latitude ? parseFloat(latitude) : 21.1458;
    const lng = longitude ? parseFloat(longitude) : 79.0882;

    const job = await Job.create({
      employerId: employer._id,
      title,
      trade,
      description,
      locationName,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      wage: parseInt(wage),
      phone,
      urgent: urgent === true || urgent === 'true'
    });

    return res.status(201).json(job);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getJobs = async (req, res) => {
  const { trade, location, wage, lat, lng, distance, search } = req.query;
  const query = { status: 'open' };

  if (trade) query.trade = trade;
  if (wage) query.wage = { $gte: parseInt(wage) };
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { locationName: { $regex: search, $options: 'i' } }
    ];
  } else if (location) {
    query.locationName = { $regex: location, $options: 'i' };
  }

  try {
    if (lat && lng) {
      const maxDistance = (parseFloat(distance) || 10) * 1000; // default 10 km in meters
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDistance
        }
      };
    }

    console.log("QUERY:", query);

    const jobs = await Job.find(query).populate('employerId', 'name');

    console.log("JOBS FOUND:", jobs.length);

if (req.user) {
  console.log("USER:", req.user?._id);

const worker = await Worker.findOne({ userId: req.user._id });

console.log("WORKER:", worker);

  if (worker) {
    const jobsWithScore = jobs.map(job => ({
      ...job.toObject(),
      matchScore: calculateMatchScore(worker, job)
    }));

    return res.json(jobsWithScore);
  }
}

return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employerId', 'name phone');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.json(job);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  const { title, trade, description, locationName, latitude, longitude, wage, phone, urgent, status } = req.body;
  try {
    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this job' });
    }

    const updateData = {
      title: title || job.title,
      trade: trade || job.trade,
      description: description || job.description,
      locationName: locationName || job.locationName,
      wage: wage ? parseInt(wage) : job.wage,
      phone: phone || job.phone,
      urgent: urgent !== undefined ? (urgent === true || urgent === 'true') : job.urgent,
      status: status || job.status
    };

    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    job = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.json(job);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.employerId.toString() !== employer._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) {
      return res.status(400).json({ message: 'Employer profile not found' });
    }
    const jobs = await Job.find({ employerId: employer._id });
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
