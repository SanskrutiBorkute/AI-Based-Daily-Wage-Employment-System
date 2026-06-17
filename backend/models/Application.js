import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  status: {
  type: String,
  enum: ['applied', 'accepted', 'completed', 'rejected'],
  default: 'applied'
},

rating: {
  type: Number,
  min: 1,
  max: 5,
  default: null
},

review: {
  type: String,
  default: ''
}

}, { timestamps: true });

const Application = mongoose.model('Application', ApplicationSchema);
export default Application;
