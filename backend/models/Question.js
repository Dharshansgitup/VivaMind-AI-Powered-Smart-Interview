const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String, // e.g., "React", "Node.js", "Data Structures", "System Design", "HR"
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['text', 'coding'],
    default: 'text'
  },
  codeSnippet: {
    type: String, // For coding challenges, standard starter code
    default: ''
  },
  testCases: {
    type: [testCaseSchema],
    default: []
  },
  sampleAnswer: {
    type: String, // Expected ideal response description
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);
