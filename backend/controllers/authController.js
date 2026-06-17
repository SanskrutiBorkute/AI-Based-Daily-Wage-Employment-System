import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_kaamsetu_key_123', {
    expiresIn: '30d'
  });
};

export const registerUser = async (req, res) => {
  const { phone, password, role } = req.body;
  try {
    if (!phone || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }
    
    const user = await User.create({ phone, password, role });
    
    return res.status(201).json({
      _id: user._id,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;
  try {
    if (!phone || !password) {
      return res.status(400).json({ message: 'Please provide phone and password' });
    }
    
    const user = await User.findOne({ phone });
    if (user && (await user.comparePassword(password))) {
      return res.json({
        _id: user._id,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.json(req.user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
