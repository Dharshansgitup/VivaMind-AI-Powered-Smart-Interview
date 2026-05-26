const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, skills, experience, targetRole, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (skills) {
      user.profile.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (experience !== undefined) user.profile.experience = Number(experience) || 0;
    if (targetRole) user.profile.targetRole = targetRole;
    if (bio) user.profile.bio = bio;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// @route   POST /api/users/resume-upload
// @desc    Simulate and parse resume content to automatically extract details
// @access  Private
router.post('/resume-upload', protect, async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Resume text content is too short or empty' });
    }

    // Advanced Local Dictionary Parsing
    const skillsKeywords = [
      'React', 'Vue', 'Angular', 'Node.js', 'Express', 'JavaScript', 'TypeScript', 'HTML', 'CSS',
      'Python', 'Django', 'Flask', 'Java', 'Spring', 'C++', 'C#', 'SQL', 'MongoDB', 'PostgreSQL',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'Machine Learning', 'TensorFlow', 'PyTorch',
      'System Design', 'Tailwind', 'Redux', 'GraphQL', 'REST API', 'Framer Motion'
    ];

    const detectedSkills = [];
    skillsKeywords.forEach(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(resumeText)) {
        // Keep original capitalization from keywords list
        detectedSkills.push(skill);
      }
    });

    // Detect experience
    let detectedExperience = 0;
    const expRegexes = [
      /(\d+)\+?\s*years?\s*of\s*experience/i,
      /(\d+)\s*years?\s*working/i,
      /experience\s*:\s*(\d+)\s*years?/i,
      /worked\s*for\s*(\d+)\s*years/i
    ];

    for (const regex of expRegexes) {
      const match = resumeText.match(regex);
      if (match && match[1]) {
        detectedExperience = Math.min(15, Math.max(0, parseInt(match[1])));
        break;
      }
    }

    // Detect target role based on titles in resume
    let targetRole = 'Software Engineer';
    const rolesList = [
      'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer', 'Data Scientist',
      'Machine Learning Engineer', 'DevOps Engineer', 'UI/UX Designer', 'Product Manager'
    ];
    for (const role of rolesList) {
      const regex = new RegExp(`\\b${role}\\b`, 'i');
      if (regex.test(resumeText)) {
        targetRole = role;
        break;
      }
    }

    // Update candidate profile
    const user = await User.findById(req.user._id);
    user.profile.skills = detectedSkills.length > 0 ? detectedSkills : user.profile.skills;
    user.profile.experience = detectedExperience > 0 ? detectedExperience : user.profile.experience;
    user.profile.targetRole = targetRole;
    user.profile.resumeText = resumeText;
    
    await user.save();

    return res.json({
      success: true,
      message: 'Resume parsed and profile updated successfully!',
      parsedData: {
        skills: user.profile.skills,
        experience: user.profile.experience,
        targetRole: user.profile.targetRole
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return res.status(500).json({ success: false, message: 'Server error parsing resume' });
  }
});

module.exports = router;
