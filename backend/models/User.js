const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['candidate', 'admin'],
    default: 'candidate'
  },
  profile: {
    skills: {
      type: [String],
      default: []
    },
    experience: {
      type: Number,
      default: 0 // Years of experience
    },
    targetRole: {
      type: String,
      default: 'Full Stack Engineer'
    },
    resumeText: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
