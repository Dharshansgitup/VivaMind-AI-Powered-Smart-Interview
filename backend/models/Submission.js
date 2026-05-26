const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'cpp'],
    default: 'javascript'
  },
  code: {
    type: String,
    required: true
  },
  passedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0 // 0-100
  },
  runOutputs: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['accepted', 'failed', 'runtime_error', 'syntax_error'],
    default: 'failed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
