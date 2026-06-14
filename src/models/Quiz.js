import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    default: 'multiple_choice'
  },
  options: [optionSchema],
  correctAnswer: {
    type: String,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: false
});

const quizSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, 
    default: 30,
    min: 1
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 1,
    max: 100
  },
  maxAttempts: {
    type: Number,
    default: 1,  
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'class'
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  showResults: {
    type: String,
    enum: ['immediately', 'after_deadline', 'manual'],
    default: 'immediately'
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showDetailedReport: {
    type: Boolean,
    default: true
  },
  resultsReleased: {
    type: Boolean,
    default: false  
  }
}, {
  timestamps: true
});

quizSchema.index({ service: 1, createdBy: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ startDate: 1 });
quizSchema.index({ classId: 1 });

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);