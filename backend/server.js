import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.js';
import workerRoutes from './routes/workers.js';
import employerRoutes from './routes/employers.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'https://kaamsetu-app.netlify.app'
    ],
    credentials: true
  })
);
app.use(express.json());

// Serve uploaded profile images
app.use('/uploads', express.static('uploads'));

// Routes API Mapping
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Simple Status Route
app.get('/', (req, res) => {
  res.json({ message: 'KaamSetu API running successfully!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in mode on port ${PORT}`);
});
