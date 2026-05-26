const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Interview = require('../models/Interview');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   GET /api/admin/sessions
// @desc    Monitor all interview sessions in the system
// @access  Private/Admin
router.get('/sessions', protect, adminOnly, async (req, res) => {
  try {
    const sessions = await Interview.find()
      .populate('candidateId', 'name email profile')
      .sort({ createdAt: -1 });

    return res.json({ success: true, sessions });
  } catch (error) {
    console.error('Fetch admin sessions error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching sessions' });
  }
});

// @route   GET /api/admin/candidates
// @desc    List all candidates with their aggregated metrics and rankings
// @access  Private/Admin
router.get('/candidates', protect, adminOnly, async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).select('-password');
    const rankedCandidates = [];

    for (const cand of candidates) {
      // Gather interview history
      const interviews = await Interview.find({ candidateId: cand._id, status: 'completed' });
      // Gather coding submissions
      const submissions = await Submission.find({ candidateId: cand._id });

      let avgInterviewScore = 0;
      let avgCommScore = 0;
      let totalCheatingTriggers = 0;

      if (interviews.length > 0) {
        avgInterviewScore = Math.round(interviews.reduce((sum, i) => sum + i.metrics.overallTechnicalScore, 0) / interviews.length);
        avgCommScore = Math.round(interviews.reduce((sum, i) => sum + i.metrics.overallCommunicationScore, 0) / interviews.length);
        totalCheatingTriggers = interviews.reduce((sum, i) => sum + i.cheatingIncidents.length, 0);
      }

      let codingSolved = 0;
      let avgCodingScore = 0;

      if (submissions.length > 0) {
        codingSolved = submissions.filter(s => s.status === 'accepted').length;
        avgCodingScore = Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length);
      }

      // Resume matching score based on experience and skills listed
      const skillCount = cand.profile.skills ? cand.profile.skills.length : 0;
      const experienceYears = cand.profile.experience || 0;
      
      const skillRating = Math.min(100, skillCount * 12); // max 100
      const experienceRating = Math.min(100, experienceYears * 10); // max 100
      const resumeScore = Math.round((skillRating * 0.5) + (experienceRating * 0.5));

      // SMART RANKING ALGORITHM
      // 1. Technical Interview Score (40%)
      // 2. Coding Assessment Score (30%)
      // 3. Speech Confidence & Communication (15%)
      // 4. Resume Match & Experience Weighting (15%)
      // Penalize for cheating triggers: subtract 10 points per tab switch / cheating incident
      const weightedScore = Math.round(
        (avgInterviewScore * 0.40) +
        (avgCodingScore * 0.30) +
        (avgCommScore * 0.15) +
        (resumeScore * 0.15)
      );

      const penalty = totalCheatingTriggers * 10;
      const overallRankScore = Math.max(0, weightedScore - penalty);

      rankedCandidates.push({
        id: cand._id,
        name: cand.name,
        email: cand.email,
        targetRole: cand.profile.targetRole,
        skills: cand.profile.skills,
        experience: cand.profile.experience,
        stats: {
          avgInterviewScore,
          avgCommScore,
          codingSolved,
          avgCodingScore,
          totalCheatingTriggers,
          overallRankScore
        }
      });
    }

    // Sort by rank score in descending order
    rankedCandidates.sort((a, b) => b.stats.overallRankScore - a.stats.overallRankScore);

    return res.json({ success: true, candidates: rankedCandidates });
  } catch (error) {
    console.error('Fetch admin candidates error:', error);
    return res.status(500).json({ success: false, message: 'Server error ranking candidates' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get aggregated platform analytics
// @access  Private/Admin
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const totalCandidates = await User.countDocuments({ role: 'candidate' });
    const totalInterviews = await Interview.countDocuments();
    const completedInterviews = await Interview.countDocuments({ status: 'completed' });
    
    // Average scores
    const interviews = await Interview.find({ status: 'completed' });
    let totalTech = 0, totalComm = 0, totalCheating = 0;
    
    interviews.forEach(i => {
      totalTech += i.metrics.overallTechnicalScore || 0;
      totalComm += i.metrics.overallCommunicationScore || 0;
      totalCheating += i.cheatingIncidents.length || 0;
    });

    const avgTech = interviews.length > 0 ? Math.round(totalTech / interviews.length) : 0;
    const avgComm = interviews.length > 0 ? Math.round(totalComm / interviews.length) : 0;

    // Submissions
    const submissions = await Submission.find();
    const codingAvg = submissions.length > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length) 
      : 0;

    return res.json({
      success: true,
      analytics: {
        totalCandidates,
        totalInterviews,
        completedInterviews,
        averageTechnicalScore: avgTech,
        averageCommunicationScore: avgComm,
        averageCodingScore: codingAvg,
        totalCheatingAlerts: totalCheating
      }
    });
  } catch (error) {
    console.error('Fetch admin analytics error:', error);
    return res.status(500).json({ success: false, message: 'Server error compiling analytics' });
  }
});

// @route   POST /api/admin/questions
// @desc    Add new question / coding challenge to the bank
// @access  Private/Admin
router.post('/questions', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, category, difficulty, type, codeSnippet, testCases, sampleAnswer } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, description and category' });
    }

    const question = await Question.create({
      title,
      description,
      category,
      difficulty: difficulty || 'medium',
      type: type || 'text',
      codeSnippet: codeSnippet || '',
      testCases: testCases || [],
      sampleAnswer: sampleAnswer || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Question added successfully to bank',
      question
    });
  } catch (error) {
    console.error('Add question error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating question' });
  }
});

module.exports = router;
