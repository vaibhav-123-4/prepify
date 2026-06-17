import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    category: { type: String },
    difficulty: { type: String },
    hint: { type: String },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answer: { type: String },
    score: { type: Number },
    strengths: { type: String },
    improvements: { type: String },
    idealAnswerHints: { type: String },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  experienceLevel: {
    type: String,
    enum: ['Fresher', '1-3 years', '3+ years'],
    required: true,
  },
  jobDescription: {
    type: String,
    default: '',
  },
  questions: [questionSchema],
  answers: [answerSchema],
  overallScore: {
    type: Number,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
