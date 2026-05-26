const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/authMiddleware');
const { runCode } = require('../utils/codeRunner');

// Seeding function inside routes to ensure database is always populated with beautiful coding challenges
const seedCodingChallenges = async () => {
  const count = await Question.countDocuments({ type: 'coding' });
  if (count === 0) {
    const seedData = [
      {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n**Example:**\n`nums = [2, 7, 11, 15], target = 9` => Returns `[0, 1]`",
        category: "Data Structures",
        difficulty: "easy",
        type: "coding",
        codeSnippet: `function solution(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        testCases: [
          { input: "[2, 7, 11, 15], 9", expectedOutput: "[0,1]", isPublic: true },
          { input: "[3, 2, 4], 6", expectedOutput: "[1,2]", isPublic: true },
          { input: "[3, 3], 6", expectedOutput: "[0,1]", isPublic: false }
        ],
        sampleAnswer: "Uses a Hash Map to track matching differences in linear O(N) time complexity."
      },
      {
        title: "Reverse String",
        description: "Write a function that takes a string and returns it reversed.\n\n**Example:**\n`'hello'` => Returns `'olleh'`\n`'SmartEdu'` => Returns `'udEtramS'`",
        category: "Algorithms",
        difficulty: "easy",
        type: "coding",
        codeSnippet: `function solution(str) {
  // Write your code here
  return str.split('').reverse().join('');
}`,
        testCases: [
          { input: "'hello'", expectedOutput: "olleh", isPublic: true },
          { input: "'antigravity'", expectedOutput: "ytivargitna", isPublic: true },
          { input: "'a'", expectedOutput: "a", isPublic: false }
        ],
        sampleAnswer: "Split string into an array, reverse the array, and join back into a string."
      },
      {
        title: "Fibonacci Number",
        description: "Write a function that calculates the `n`-th Fibonacci number. The sequence is defined as:\n`F(0) = 0, F(1) = 1`\n`F(n) = F(n - 1) + F(n - 2)` for `n > 1`.\n\n**Example:**\n`n = 6` => Returns `8`",
        category: "Algorithms",
        difficulty: "medium",
        type: "coding",
        codeSnippet: `function solution(n) {
  // Write your code here
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1, current = 0;
  for (let i = 2; i <= n; i++) {
    current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return current;
}`,
        testCases: [
          { input: "6", expectedOutput: "8", isPublic: true },
          { input: "10", expectedOutput: "55", isPublic: true },
          { input: "0", expectedOutput: "0", isPublic: false }
        ],
        sampleAnswer: "Iterative approach with O(N) time and O(1) auxiliary space complexity."
      }
    ];

    await Question.create(seedData);
    console.log("Seed coding challenges successfully written to MongoDB.");
  }
};

// @route   GET /api/coding/challenges
// @desc    Get all coding challenges
// @access  Private
router.get('/challenges', protect, async (req, res) => {
  try {
    await seedCodingChallenges();
    const challenges = await Question.find({ type: 'coding' });
    return res.json({ success: true, challenges });
  } catch (error) {
    console.error('Fetch challenges error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching challenges' });
  }
});

// @route   POST /api/coding/run
// @desc    Test compile/execute code against public test cases
// @access  Private
router.post('/run', protect, async (req, res) => {
  try {
    const { questionId, language, code } = req.body;

    if (!questionId || !code) {
      return res.status(400).json({ success: false, message: 'Please provide questionId and code' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Coding challenge not found' });
    }

    // Filter only public test cases to return run-time diagnostics
    const publicTestCases = question.testCases.filter(tc => tc.isPublic);
    const runResult = runCode(language, code, publicTestCases);

    return res.json({
      success: true,
      runResult
    });
  } catch (error) {
    console.error('Run code error:', error);
    return res.status(500).json({ success: false, message: 'Server error during execution' });
  }
});

// @route   POST /api/coding/submit
// @desc    Submit final code and grade against all test cases
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { questionId, language, code } = req.body;

    if (!questionId || !code) {
      return res.status(400).json({ success: false, message: 'Please provide questionId and code' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Coding challenge not found' });
    }

    // Evaluate against ALL test cases (both public and hidden)
    const runResult = runCode(language, code, question.testCases);

    // Calculate score
    const score = runResult.totalCount > 0 
      ? Math.round((runResult.passedCount / runResult.totalCount) * 100) 
      : 0;

    // Output status logs
    let status = 'failed';
    if (runResult.status === 'syntax_error') status = 'syntax_error';
    else if (score === 100) status = 'accepted';

    // Store in Database
    const submission = await Submission.create({
      candidateId: req.user._id,
      questionId,
      language,
      code,
      passedCount: runResult.passedCount,
      totalCount: runResult.totalCount,
      score,
      status,
      runOutputs: runResult.results.map(r => r.stdout)
    });

    return res.status(201).json({
      success: true,
      message: 'Code submitted and recorded successfully',
      submission
    });
  } catch (error) {
    console.error('Submit code error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving submission' });
  }
});

module.exports = router;
