import express from 'express';
import auth from '../middleware/auth.js';
import Session from '../models/Session.js';
import { generateQuestions, evaluateAnswer } from '../services/groqService.js';

const router = express.Router();

// All routes in this file require authentication
router.use(auth);

// POST /api/interview/start
router.post('/start', async (req, res) => {
  try {
    const { role, experienceLevel, jobDescription, questionCount } = req.body;

    if (!role || !experienceLevel) {
      return res.status(400).json({ message: 'Role and experienceLevel are required' });
    }

    const questions = await generateQuestions({ role, experienceLevel, jobDescription, questionCount });

    const session = await Session.create({
      userId: req.user.userId,
      role,
      experienceLevel,
      jobDescription: jobDescription || '',
      questions,
    });

    res.status(201).json({ sessionId: session._id, questions });
  } catch (error) {
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
      .select('role experienceLevel overallScore completedAt createdAt');

    const result = sessions.map((s) => ({
      sessionId: s._id,
      role: s.role,
      experienceLevel: s.experienceLevel,
      overallScore: s.overallScore,
      completedAt: s.completedAt,
      createdAt: s.createdAt,
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
