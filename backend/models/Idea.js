const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    analysisResult: {
      matchedIdea: {
        type: String,
        default: 'No reference ideas available'
      },
      similarityScore: {
        type: Number,
        default: 0
      },
      marketScore: {
        type: Number,
        default: 0
      },
      competitionScore: {
        type: Number,
        default: 0
      },
      feasibilityScore: {
        type: Number,
        default: 0
      },
      innovationScore: {
        type: Number,
        default: 0
      },
      totalScore: {
        type: Number,
        default: 0
      },
      successProbability: {
        type: Number,
        default: 0
      },
      suggestion: {
        type: String,
        default: 'Add more detail to strengthen your idea.'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Idea', ideaSchema);
