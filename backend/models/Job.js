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

const JobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  trade: {
    type: String,
    required: true
  },
  description: {
    type: String,
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
  phone: {
    type: String,
    required: true,
    trim: true
  },
  urgent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['open', 'filled', 'closed'],
    default: 'open'
  }
}, { timestamps: true });

JobSchema.index({ location: '2dsphere' });

const Job = mongoose.model('Job', JobSchema);
export default Job;
