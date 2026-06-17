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

const EmployerSchema = new mongoose.Schema({
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
  locationName: {
    type: String,
    default: ''
  },
  location: {
    type: PointSchema,
    required: false
  }
}, { timestamps: true });

EmployerSchema.index({ location: '2dsphere' });

const Employer = mongoose.model('Employer', EmployerSchema);
export default Employer;
