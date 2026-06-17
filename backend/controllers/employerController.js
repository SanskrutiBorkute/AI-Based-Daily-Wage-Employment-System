import Employer from '../models/Employer.js';

export const createOrUpdateEmployerProfile = async (req, res) => {
  const { name, phone, locationName, latitude, longitude } = req.body;
  try {
    if (!name || !phone) {
      return res.status(400).json({ message: 'Please provide name and phone number' });
    }

    const lat = latitude ? parseFloat(latitude) : 21.1458;
    const lng = longitude ? parseFloat(longitude) : 79.0882;

    const profileData = {
      userId: req.user._id,
      name,
      phone,
      locationName: locationName || '',
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    };

    const employer = await Employer.findOneAndUpdate(
      { userId: req.user._id },
      profileData,
      { new: true, upsert: true }
    );

    return res.status(200).json(employer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyEmployerProfile = async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) {
      return res.status(404).json({ message: 'Employer profile not found' });
    }
    return res.json(employer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
