const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/authMiddleware');
const { generateAIQuestion, evaluateAIAnswer, generateAIFinalReport } = require('../utils/gemini');

// @route   POST /api/interviews/start
// @desc    Start a new interview session and fetch the opening question
// @access  Private
router.post('/start', protect, async (req, res) => {
  try {
    const { title, type } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const targetRole = user.profile.targetRole || 'Full Stack Engineer';
    const skills = user.profile.skills && user.profile.skills.length > 0 ? user.profile.skills : ['React', 'JavaScript', 'Node.js'];
    const experience = user.profile.experience || 0;

    let questionText = '';
    let category = 'General';
    let difficulty = 'medium';

    // Check if the Teacher has entered custom verbal questions in the database
    const presetQuestions = await Question.find({ type: 'text' }).sort({ createdAt: 1 });
    
    if (presetQuestions.length > 0) {
      // Pick the first preset question
      questionText = presetQuestions[0].description;
      category = presetQuestions[0].category;
      difficulty = presetQuestions[0].difficulty;
      console.log('Serving Teacher-Preset Opening Question:', questionText);
    } else {
      // Fallback: Call Gemini to generate the opening question dynamically
      const aiQuestion = await generateAIQuestion(targetRole, skills, experience, []);
      questionText = aiQuestion.question;
      category = aiQuestion.category;
      difficulty = aiQuestion.difficulty;
      console.log('Serving AI-Generated Opening Question:', questionText);
    }

    // Create new interview session
    const interview = await Interview.create({
      candidateId: req.user._id,
      title: title || `${targetRole} AI Assessment`,
      type: type || 'technical',
      status: 'in_progress',
      questions: [{
        questionText: questionText,
        category: category,
        difficulty: difficulty,
        answerTranscript: '',
        confidenceScore: 0
      }]
    });

    return res.status(201).json({
      success: true,
      message: 'Interview session started',
      interviewId: interview._id,
      currentQuestion: {
        index: 0,
        text: questionText,
        category: category,
        difficulty: difficulty
      }
    });
  } catch (error) {
    console.error('Start interview error:', error);
    return res.status(500).json({ success: false, message: 'Server error starting interview' });
  }
});

// @route   POST /api/interviews/:id/answer
// @desc    Submit answer transcript for current question and evaluate it in real time
// @access  Private
router.post('/:id/answer', protect, async (req, res) => {
  try {
    const { answerTranscript, stressLevel, focusScore, confidenceScore } = req.body;
    const interviewId = req.params.id;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Interview session is not active' });
    }

    const currentQuestionIdx = interview.questions.length - 1;
    const currentQuestion = interview.questions[currentQuestionIdx];

    if (currentQuestion.answerTranscript) {
      return res.status(400).json({ success: false, message: 'Current question has already been answered' });
    }

    // Save candidate's transcript
    currentQuestion.answerTranscript = answerTranscript || 'No response recorded.';
    
    // Evaluate answer via Gemini AI
    const evaluation = await evaluateAIAnswer(currentQuestion.questionText, currentQuestion.answerTranscript);

    // Save evaluations
    currentQuestion.evaluation = {
      score: evaluation.score,
      technicalAccuracy: evaluation.technicalAccuracy,
      communicationSkills: evaluation.communicationSkills,
      feedback: evaluation.feedback
    };
    currentQuestion.sentiment = evaluation.sentiment;
    currentQuestion.confidenceScore = evaluation.confidenceScore;

    // Log biometrics telemetry if provided
    if (stressLevel || focusScore !== undefined) {
      interview.metrics.faceScanLogs.push({
        timestamp: new Date(),
        stressLevel: stressLevel || 'Low',
        focusScore: focusScore !== undefined ? Number(focusScore) : 95,
        confidenceScore: confidenceScore !== undefined ? Number(confidenceScore) : evaluation.confidenceScore
      });
    }

    await interview.save();

    return res.json({
      success: true,
      message: 'Answer submitted and evaluated successfully',
      evaluation: currentQuestion.evaluation,
      sentiment: currentQuestion.sentiment,
      confidenceScore: currentQuestion.confidenceScore
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({ success: false, message: 'Server error submitting answer' });
  }
});

// @route   POST /api/interviews/:id/next
// @desc    Generate and fetch the next question
// @access  Private
router.post('/:id/next', protect, async (req, res) => {
  try {
    const interviewId = req.params.id;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Interview session is not active' });
    }

    const totalQuestions = interview.questions.length;
    // Cap interviews at 5 dynamic questions for balance
    if (totalQuestions >= 5) {
      return res.json({
        success: true,
        completed: true,
        message: 'Maximum question limit reached. Please finalize interview.'
      });
    }

    const user = await User.findById(req.user._id);
    const targetRole = user.profile.targetRole || 'Full Stack Engineer';
    const skills = user.profile.skills && user.profile.skills.length > 0 ? user.profile.skills : ['React', 'Node.js'];
    const experience = user.profile.experience || 0;

    let questionText = '';
    let category = 'General';
    let difficulty = 'medium';

    // Check if Teacher has custom verbal questions entered
    const presetQuestions = await Question.find({ type: 'text' }).sort({ createdAt: 1 });

    if (presetQuestions.length > totalQuestions) {
      // Pick the next preset question in chronological order
      questionText = presetQuestions[totalQuestions].description;
      category = presetQuestions[totalQuestions].category;
      difficulty = presetQuestions[totalQuestions].difficulty;
      console.log(`Serving Teacher-Preset Question #${totalQuestions + 1}:`, questionText);
    } else {
      // Fallback: Generate follow-up question via Gemini based on history
      const aiQuestion = await generateAIQuestion(targetRole, skills, experience, interview.questions);
      questionText = aiQuestion.question;
      category = aiQuestion.category;
      difficulty = aiQuestion.difficulty;
      console.log(`Serving AI-Generated Question #${totalQuestions + 1}:`, questionText);
    }

    // Push new question into interview questions list
    interview.questions.push({
      questionText: questionText,
      category: category,
      difficulty: difficulty,
      answerTranscript: '',
      confidenceScore: 0
    });

    await interview.save();

    return res.json({
      success: true,
      completed: false,
      currentQuestion: {
        index: totalQuestions,
        text: questionText,
        category: category,
        difficulty: difficulty
      }
    });
  } catch (error) {
    console.error('Fetch next question error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating next question' });
  }
});

// @route   POST /api/interviews/:id/cheating
// @desc    Log a cheating incident (e.g., tab switch, face lost)
// @access  Private
router.post('/:id/cheating', protect, async (req, res) => {
  try {
    const { type } = req.body;
    const interviewId = req.params.id;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    interview.cheatingIncidents.push({
      timestamp: new Date(),
      type: type || 'tab_switch'
    });

    await interview.save();

    return res.json({
      success: true,
      message: 'Cheating alert logged successfully',
      incidentCount: interview.cheatingIncidents.length
    });
  } catch (error) {
    console.error('Log cheating error:', error);
    return res.status(500).json({ success: false, message: 'Server error logging incident' });
  }
});

// @route   POST /api/interviews/:id/finalize
// @desc    Finalize interview session and generate the final diagnostic report
// @access  Private
router.post('/:id/finalize', protect, async (req, res) => {
  try {
    const interviewId = req.params.id;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.status === 'completed') {
      return res.json({ success: true, message: 'Interview already finalized', interview });
    }

    // Calculate aggregated scores
    let totalTechScore = 0;
    let totalCommScore = 0;
    let answeredQuestionsCount = 0;
    const sentimentCounts = {};

    interview.questions.forEach(q => {
      if (q.answerTranscript) {
        totalTechScore += q.evaluation.score;
        // Communication is modeled by confidence + articulation evaluations
        totalCommScore += q.confidenceScore;
        answeredQuestionsCount++;

        // Track sentiments
        const sent = q.sentiment || 'Neutral';
        sentimentCounts[sent] = (sentimentCounts[sent] || 0) + 1;
      }
    });

    const overallTech = answeredQuestionsCount > 0 ? Math.round(totalTechScore / answeredQuestionsCount) : 0;
    const overallComm = answeredQuestionsCount > 0 ? Math.round(totalCommScore / answeredQuestionsCount) : 0;

    interview.metrics.overallTechnicalScore = overallTech;
    interview.metrics.overallCommunicationScore = overallComm;
    
    // Save map of sentiments
    const sentimentMap = new Map();
    Object.keys(sentimentCounts).forEach(key => {
      sentimentMap.set(key, sentimentCounts[key]);
    });
    interview.metrics.sentimentSummary = sentimentMap;

    // Fetch coding submissions to attach metrics to the report
    const codingSubmissions = await Submission.find({ candidateId: req.user._id }).populate('questionId');
    const codingStats = {
      completed: codingSubmissions.length,
      avgScore: codingSubmissions.length > 0 
        ? Math.round(codingSubmissions.reduce((sum, s) => sum + s.score, 0) / codingSubmissions.length) 
        : 0
    };

    // Call Gemini to synthesize a beautiful final markdown review report
    const user = await User.findById(req.user._id);
    const finalReportMD = await generateAIFinalReport(
      user.name,
      user.profile.targetRole || 'Full Stack Engineer',
      interview.questions,
      codingStats
    );

    interview.aiReport = finalReportMD;
    interview.status = 'completed';
    await interview.save();

    // Automatically save a print-ready file report in backend/reports/
    try {
      const reportsDir = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const sanitizeName = user.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `report_${sanitizeName}_${interview._id}.md`;
      const reportPath = path.join(reportsDir, filename);

      const fileContent = `
# Student Assessment Details: ${user.name}
*   **Email**: ${user.email}
*   **Target Role**: ${user.profile.targetRole || 'Full Stack Engineer'}
*   **Experience**: ${user.profile.experience || 0} years
*   **Date**: ${new Date(interview.createdAt).toLocaleString()}
*   **Platform Key**: ${interview._id}

---

## 📊 Score Diagnostics
*   **Technical Interview Score**: ${overallTech}/100
*   **Speech Communication Score**: ${overallComm}/100
*   **Coding Assessment solved**: ${codingStats.completed} tasks (Average Score: ${codingStats.avgScore}/100)
*   **Malpractice warnings count**: ${interview.cheatingIncidents.length} triggers

---

## 📝 Speech Q&A transcripts
${interview.questions.map((q, i) => `
### Question ${i + 1}: ${q.questionText}
*   **Student Transcript**: "${q.answerTranscript || 'No response captured.'}"
*   **AI Score**: ${q.evaluation.score}/100
*   **Sentiment**: ${q.sentiment} (Confidence: ${q.confidenceScore}%)
*   **Accuracy grading**: ${q.evaluation.technicalAccuracy}
*   **Communication feedback**: ${q.evaluation.communicationSkills}
`).join('\n')}

---

## 🤖 Synthesized AI Executive Review (Gemini)
${finalReportMD}
      `;

      fs.writeFileSync(reportPath, fileContent.trim());
      console.log(`Saved candidate report file to local filesystem: ${reportPath}`);
    } catch (writeErr) {
      console.error("Failed to write report file:", writeErr);
    }

    return res.json({
      success: true,
      message: 'Interview session finalized successfully',
      overallTechnicalScore: overallTech,
      overallCommunicationScore: overallComm,
      report: finalReportMD,
      interview
    });
  } catch (error) {
    console.error('Finalize interview error:', error);
    return res.status(500).json({ success: false, message: 'Server error finalising interview' });
  }
});

// @route   GET /api/interviews/history
// @desc    Get candidate's previous interview sessions
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Interview.find({ candidateId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, history });
  } catch (error) {
    console.error('Fetch history error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching interview history' });
  }
});

// @route   GET /api/interviews/:id/report
// @desc    Get detailed report details for a specific interview
// @access  Private
router.get('/:id/report', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('candidateId', 'name email profile');
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview report not found' });
    }

    // Security: Only candidate themselves or administrators can read this report
    if (req.user.role !== 'admin' && interview.candidateId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.json({ success: true, interview });
  } catch (error) {
    console.error('Fetch report error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching report' });
  }
});

module.exports = router;
