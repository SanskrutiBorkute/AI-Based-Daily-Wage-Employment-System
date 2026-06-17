import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

const WorkerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  trade: {
    type: String,
    enum: ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mason', 'Welder', 'Helper', 'Cook', 'Driver', 'Gardener'],
    required: true
  },
  experience: {
    type: String,
    enum: ['0-1', '1-3', '3-5', '5-10', '10+'],
    required: true
  },
  locationName: {
    type: String,
    required: true
  },
  location: {
    type: PointSchema,
    required: true
  },
  wage: {
    type: Number,
    required: true
  },
  availability: {
    type: String,
    enum: ['now', 'soon', 'busy'],
    default: 'now'
  },
  languages: {
    type: [String],
    default: ['Hindi']
  },
  rating: {
    type: Number,
    default: 5.0
  },
  jobsCount: {
    type: Number,
    default: 0
  },
  totalRatings: {
  type: Number,
  default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  avatarColor: {
    type: String,
    default: '#F05A1A'
  },
  profileImage: {
    type: String,
    default: ''
  }
}, { timestamps: true });

WorkerSchema.index({ location: '2dsphere' });

const Worker = mongoose.model('Worker', WorkerSchema);
export default Worker;
