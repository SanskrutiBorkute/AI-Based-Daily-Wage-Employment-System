import Worker from '../models/Worker.js';

export const createOrUpdateWorkerProfile = async (req, res) => {
  const {
    name,
    phone,
    trade,
    experience,
    locationName,
    latitude,
    longitude,
    wage,
    availability,
    languages,
    avatarColor
  } = req.body;

  try {
    if (!name || !phone || !trade || !experience || !locationName) {
      return res.status(400).json({ message: 'Please fill all required profile fields' });
    }

    const lat = latitude ? parseFloat(latitude) : 21.1458; // Default Nagpur lat
    const lng = longitude ? parseFloat(longitude) : 79.0882; // Default Nagpur lng

    const profileData = {
      userId: req.user._id,
      name,
      phone,
      trade,
      experience,
      locationName,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      wage: parseInt(wage) || 500,
      availability: availability || 'now',
      languages: Array.isArray(languages) ? languages : (languages ? languages.split(',') : ['Hindi']),
      avatarColor: avatarColor || '#F05A1A'
    };

    const worker = await Worker.findOneAndUpdate(
      { userId: req.user._id },
      profileData,
      { new: true, upsert: true }
    );

    return res.status(200).json(worker);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getWorkers = async (req, res) => {
  const { trade, availability, lat, lng, distance, search } = req.query;
  const query = {};

  if (trade) {
    query.trade = trade;
  }
  if (availability) {
    query.availability = availability;
  }
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { locationName: { $regex: search, $options: 'i' } }
    ];
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

    const workers = await Worker.find(query);
    return res.json(workers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found' });
    }
    return res.json(worker);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    return res.json(worker);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const worker = await Worker.findOneAndUpdate(
      { userId: req.user._id },
      { profileImage: imageUrl },
      { new: true }
    );

    if (!worker) {
      return res.status(404).json({ message: 'Create profile first before uploading image' });
    }

    return res.json({ imageUrl, worker });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
