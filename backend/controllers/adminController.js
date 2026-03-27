const AdminIdea = require('../models/AdminIdea');
const Idea = require('../models/Idea');
const { analyseIdea, extractKeywords, ensureIdeaAnalysisUpToDate } = require('./ideaController');

const createAdminIdea = async (req, res, next) => {
  try {
    const { title, description, keywords } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const parsedKeywords = Array.isArray(keywords)
      ? keywords
      : typeof keywords === 'string'
        ? keywords.split(',').map((keyword) => keyword.trim().toLowerCase())
        : extractKeywords(`${title} ${description}`);

    const adminIdea = await AdminIdea.create({
      title,
      description,
      keywords: parsedKeywords.filter(Boolean)
    });

    return res.status(201).json({
      message: 'Reference idea added successfully.',
      adminIdea
    });
  } catch (error) {
    next(error);
  }
};

const getAdminIdeas = async (req, res, next) => {
  try {
    const adminIdeas = await AdminIdea.find().sort({ createdAt: -1 });
    return res.status(200).json(adminIdeas);
  } catch (error) {
    next(error);
  }
};

const getAllUserIdeas = async (req, res, next) => {
  try {
    const ideas = await Idea.find().sort({ createdAt: -1 }).populate('userId', 'name email');
    const refreshedIdeas = await Promise.all(ideas.map((idea) => ensureIdeaAnalysisUpToDate(idea)));
    return res.status(200).json(refreshedIdeas);
  } catch (error) {
    next(error);
  }
};

const triggerAnalysis = async (req, res, next) => {
  try {
    const ideas = await Idea.find();

    const updatedIdeas = await Promise.all(
      ideas.map(async (idea) => {
        idea.analysisResult = await analyseIdea(idea.title, idea.description);
        await idea.save();
        return idea;
      })
    );

    return res.status(200).json({
      message: 'Analysis refreshed for all submitted ideas.',
      updatedCount: updatedIdeas.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdminIdea,
  getAdminIdeas,
  getAllUserIdeas,
  triggerAnalysis
};
