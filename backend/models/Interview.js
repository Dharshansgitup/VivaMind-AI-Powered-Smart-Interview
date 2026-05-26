const mongoose = require('mongoose');

const questionSessionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  answerTranscript: {
    type: String,
    default: ''
  },
  evaluation: {
    score: {
      type: Number,
      default: 0 // 0-100
    },
    technicalAccuracy: {
      type: String,
      default: ''
    },
    communicationSkills: {
      type: String,
      default: ''
    },
    feedback: {
      type: String,
      default: ''
    }
  },
  sentiment: {
    type: String,
    default: 'Neutral'
  },
  confidenceScore: {
    type: Number,
    default: 0 // 0-100
  }
});

const interviewSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'hybrid'],
    default: 'technical'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed'],
    default: 'scheduled'
  },
  questions: {
    type: [questionSessionSchema],
    default: []
  },
  metrics: {
    overallTechnicalScore: {
      type: Number,
      default: 0
    },
    overallCommunicationScore: {
      type: Number,
      default: 0
    },
    sentimentSummary: {
      type: Map,
      of: Number,
      default: {}
    },
    faceScanLogs: [{
      timestamp: { type: Date, default: Date.now },
      stressLevel: String,
      focusScore: Number,
      confidenceScore: Number
    }]
  },
  cheatingIncidents: [{
    timestamp: { type: Date, default: Date.now },
    type: { type: String } // e.g., "tab_switch", "face_lost", "multiple_faces"
  }],
  aiReport: {
    type: String, // Final generated detailed Markdown evaluation report
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Interview', interviewSchema);
