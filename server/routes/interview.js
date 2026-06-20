import express from 'express';
import auth from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';
import Session from '../models/Session.js';
import { generateQuestions, evaluateAnswer } from '../services/groqService.js';
import { extractTextFromPDF } from '../services/pdfService.js';

const router = express.Router();

// All routes in this file require authentication
router.use(auth);

// POST /api/interview/start
router.post('/start', uploadResume, async (req, res) => {
  try {
    const { role, experienceLevel, jobDescription, questionCount } = req.body;

    if (!role || !experienceLevel) {
      return res.status(400).json({ message: 'Role and experienceLevel are required' });
    }

    // Extract resume text if PDF was uploaded
    let resumeText = null;
    if (req.file) {
      try {
        resumeText = await extractTextFromPDF(req.file.buffer);
        console.log(`Resume extracted: ${resumeText.length} chars`);
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr.message);
        return res.status(400).json({ message: 'Failed to parse PDF. Please upload a valid PDF file.' });
      }
    }

    const questions = await generateQuestions({
      role,
      experienceLevel,
      jobDescription,
      questionCount: questionCount ? parseInt(questionCount, 10) : 5,
      resumeText,
    });

    const session = await Session.create({
      userId: req.user.userId,
      role,
      experienceLevel,
      jobDescription: jobDescription || '',
      questions,
      resumeUsed: !!resumeText,
    });

    res.status(201).json({ sessionId: session._id, questions, resumeUsed: !!resumeText });
  } catch (error) {
    // Handle multer-specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.message === 'Only PDF files are allowed') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Start interview error:', error);
    res.status(500).json({ message: 'Failed to start interview session', error: error.message });
  }
});

// POST /api/interview/answer
router.post('/answer', async (req, res) => {
  try {
    const { sessionId, questionId, answer } = req.body;

    if (!sessionId || !questionId || !answer) {
      return res.status(400).json({ message: 'sessionId, questionId, and answer are required' });
    }

    const session = await Session.findOne({ _id: sessionId, userId: req.user.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found in session' });
    }

    const evaluation = await evaluateAnswer({
      question: question.question,
      answer,
      role: session.role,
      experienceLevel: session.experienceLevel,
    });

    session.answers.push({
      questionId,
      answer,
      score: evaluation.score,
      strengths: Array.isArray(evaluation.strengths)
        ? evaluation.strengths.join('; ')
        : evaluation.strengths,
      improvements: Array.isArray(evaluation.improvements)
        ? evaluation.improvements.join('; ')
        : evaluation.improvements,
      idealAnswerHints: evaluation.idealAnswerHints,
    });

    await session.save();

    res.json(evaluation);
  } catch (error) {
    console.error('Answer evaluation error:', error.message);
    res.status(500).json({ message: 'Failed to evaluate answer' });
  }
});

// POST /api/interview/complete
router.post('/complete', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const session = await Session.findOne({ _id: sessionId, userId: req.user.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Fill in skipped questions with score 0 (mark as skipped, skip Mongoose validation)
    for (const q of session.questions) {
      const hasAnswer = session.answers.some((a) => a.questionId === q.id);
      if (!hasAnswer) {
        session.answers.push({
          questionId: q.id,
          answer: 'Skipped',
          score: 0,
          strengths: '',
          improvements: 'Question was skipped.',
          idealAnswerHints: '',
        });
      }
    }

    if (session.answers.length > 0) {
      const totalScore = session.answers.reduce((sum, a) => sum + (a.score || 0), 0);
      session.overallScore = Math.round((totalScore / session.answers.length) * 10) / 10;
    } else {
      session.overallScore = 0;
    }

    // Calculate category-wise breakdown
    const categoryBreakdown = {};
    session.questions.forEach((q) => {
      const category = q.category || 'General';
      const answer = session.answers.find((a) => a.questionId === q.id);
      const score = answer ? answer.score || 0 : 0;

      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { total: 0, count: 0 };
      }
      categoryBreakdown[category].total += score;
      categoryBreakdown[category].count += 1;
    });

    const categoryScores = Object.entries(categoryBreakdown).map(
      ([category, data]) => ({
        category,
        averageScore: Math.round((data.total / data.count) * 10) / 10,
        questionCount: data.count,
      })
    );

    session.categoryScores = categoryScores;
    session.completedAt = new Date();
    await session.save({ validateBeforeSave: false });

    res.json(session);
  } catch (error) {
    console.error('Complete session error:', error.message);
    res.status(500).json({ message: 'Failed to complete session' });
  }
});

// GET /api/interview/sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('role experienceLevel overallScore completedAt createdAt categoryScores');

    const result = sessions.map((s) => ({
      sessionId: s._id,
      role: s.role,
      experienceLevel: s.experienceLevel,
      overallScore: s.overallScore,
      completedAt: s.completedAt,
      createdAt: s.createdAt,
      categoryScores: s.categoryScores || [],
    }));

    res.json(result);
  } catch (error) {
    console.error('Fetch sessions error:', error.message);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

// GET /api/interview/session/:id
router.get('/session/:id', async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Fetch session error:', error.message);
    res.status(500).json({ message: 'Failed to fetch session' });
  }
});

export default router;
