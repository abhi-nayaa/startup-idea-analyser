const Idea = require('../models/Idea');
const AdminIdea = require('../models/AdminIdea');

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'with',
  'your'
]);

const SYNONYMS = {
  wears: 'clothing',
  dress: 'clothing',
  apparel: 'clothing',
  fashion: 'clothing',
  women: 'female',
  ladies: 'female'
};

const normalize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const replaceSynonyms = (text = '') =>
  text
    .split(' ')
    .filter(Boolean)
    .map((word) => SYNONYMS[word] || word)
    .join(' ');

const prepareComparableText = (text = '') => replaceSynonyms(normalize(text));

const extractKeywords = (text) => {
  const words = prepareComparableText(text)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return [...new Set(words)];
};

const buildSuggestion = (referenceIdea, matchedKeywords, userKeywords) => {
  if (!referenceIdea) {
    return 'No admin reference ideas exist yet. Add a clearer target audience, problem statement, and revenue model.';
  }

  const missingKeywords = referenceIdea.keywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const missingText = missingKeywords.slice(0, 3).join(', ');

  if (!matchedKeywords.length) {
    return `Your idea currently overlaps very little with "${referenceIdea.title}". Consider highlighting market need, differentiation, and execution details such as ${missingText || 'customer pain points, traction, and monetization'}.`;
  }

  if (matchedKeywords.length === userKeywords.length) {
    return `Strong alignment with "${referenceIdea.title}". Improve it further by adding validation, customer acquisition strategy, and a clear competitive edge.`;
  }

  return `Closest match is "${referenceIdea.title}". Strengthen the concept by expanding on ${missingText || 'problem validation, uniqueness, and business model'}.`;
};

const calculateSimilarity = (userText, keywords) => {
  if (!keywords.length) {
    return 0;
  }

  const comparableText = prepareComparableText(userText);
  const comparableKeywords = keywords.map((keyword) => prepareComparableText(keyword)).filter(Boolean);
  if (!comparableKeywords.length) {
    return 0;
  }
  let matchCount = 0;

  comparableKeywords.forEach((word) => {
    if (comparableText.includes(word)) {
      matchCount += 1;
    }
  });

  return (matchCount / comparableKeywords.length) * 100;
};

const calculateAdvancedSimilarity = (userText, keywords) => {
  if (!keywords.length) {
    return 0;
  }

  const normalizedUserText = prepareComparableText(userText);
  const words = normalizedUserText.split(' ').filter(Boolean);
  const comparableKeywords = keywords.map((keyword) => prepareComparableText(keyword)).filter(Boolean);
  if (!comparableKeywords.length || !words.length) {
    return 0;
  }
  let matchCount = 0;

  comparableKeywords.forEach((keyword) => {
    words.forEach((word) => {
      if (word.includes(keyword) || keyword.includes(word)) {
        matchCount += 1;
      }
    });
  });

  const score = (matchCount / comparableKeywords.length) * 100;
  return Math.min(Math.round(score), 100);
};

const getReferenceKeywords = (adminIdea) =>
  adminIdea.keywords.length > 0
    ? adminIdea.keywords.map((keyword) => prepareComparableText(keyword)).filter(Boolean)
    : extractKeywords(`${adminIdea.title} ${adminIdea.description}`);

const findSimilarStartups = async (title, description) => {
  const adminIdeas = await AdminIdea.find();
  const userText = prepareComparableText(`${title} ${description}`);

  const scoredStartups = adminIdeas.map((startup) => {
    const referenceKeywords = getReferenceKeywords(startup);
    const score = calculateAdvancedSimilarity(userText, referenceKeywords);

    console.log('User Text:', userText);
    console.log('Keywords:', startup.keywords);
    console.log('Score:', score);

    return {
      title: startup.title,
      description: startup.description,
      keywords: startup.keywords,
      score
    };
  });

  let similarStartups = scoredStartups
    .filter((startup) => startup.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!similarStartups.length && scoredStartups.length) {
    similarStartups = [...scoredStartups].sort((a, b) => b.score - a.score).slice(0, 1);
  }

  return similarStartups;
};

const generateSWOT = (description) => {
  const text = description.toLowerCase();

  const strengths = [
    'Addresses a real-world problem',
    'Potential for scalability',
    'Technology-driven solution'
  ];
  const weaknesses = [
    'Requires clear target audience',
    'Execution complexity may be high',
    'Initial funding may be needed'
  ];
  const opportunities = [
    'Growing market demand',
    'Scope for innovation',
    'Partnership opportunities'
  ];
  const threats = [
    'Existing competitors',
    'Market saturation',
    'User adoption challenges'
  ];

  if (text.includes('ai') || text.includes('automation') || text.includes('smart')) {
    strengths[2] = 'Strong technology-led differentiation';
  }

  if (text.includes('market') || text.includes('growth') || text.includes('demand')) {
    opportunities[0] = 'Clear signs of market demand';
  }

  if (text.includes('cost') || text.includes('implementation')) {
    weaknesses[1] = 'Implementation and operational complexity could be significant';
  }

  if (text.includes('competitor') || text.includes('crowded') || text.includes('existing')) {
    threats[0] = 'Competitive pressure may be intense';
  }

  if (text.includes('ai')) {
    strengths.push('Leverages AI technology for automation');
  }

  if (text.includes('students')) {
    opportunities.push('Targets a large student market');
  }

  if (text.includes('app')) {
    strengths.push('Mobile-first solution increases accessibility');
  }

  return {
    strengths,
    weaknesses,
    opportunities,
    threats
  };
};

const analyzeIdea = (description) => {
  const text = description.toLowerCase().replace(/\s+/g, ' ').trim();
  const marketKeywords = ['market', 'users', 'customers', 'demand', 'people', 'growth', 'need'];
  const competitionKeywords = ['competitor', 'existing', 'similar', 'already', 'crowded', 'marketplace'];
  const feasibilityKeywords = ['technology', 'app', 'system', 'implementation', 'cost', 'platform'];
  const innovationKeywords = ['new', 'unique', 'innovative', 'smart', 'ai', 'automation'];

  const calculateScore = (inputText, keywords) => {
    let score = 0;

    keywords.forEach((word) => {
      if (inputText.includes(word)) {
        const matches = inputText.match(new RegExp(word, 'g'));
        score += (matches ? matches.length : 0) * 5;
      }
    });

    return Math.min(score, 25);
  };

  const calculateCompetitionScore = (inputText) => {
    let matches = 0;

    competitionKeywords.forEach((word) => {
      if (inputText.includes(word)) {
        matches += 1;
      }
    });

    let score;

    if (matches === 0) {
      score = 12;
    } else if (matches <= 2) {
      score = 18;
    } else if (matches <= 4) {
      score = 10;
    } else {
      score = 5;
    }

    if (inputText.includes('no competitors') || inputText.includes('unique solution')) {
      score += 5;
    }

    return Math.min(score, 25);
  };

  let marketScore = calculateScore(text, marketKeywords);
  let competitionScore = calculateCompetitionScore(text);
  let feasibilityScore = calculateScore(text, feasibilityKeywords);
  let innovationScore = calculateScore(text, innovationKeywords);

  if (text.length > 100) {
    marketScore += 5;
    competitionScore += 5;
    feasibilityScore += 5;
    innovationScore += 5;
  }

  marketScore = marketScore || 5;
  competitionScore = competitionScore || 5;
  feasibilityScore = feasibilityScore || 5;
  innovationScore = innovationScore || 5;

  marketScore = Math.min(marketScore, 25);
  competitionScore = Math.min(competitionScore, 25);
  feasibilityScore = Math.min(feasibilityScore, 25);
  innovationScore = Math.min(innovationScore, 25);

  const totalScore = marketScore + competitionScore + feasibilityScore + innovationScore;
  const successProbability = Math.round((totalScore / 100) * 100);

  return {
    marketScore,
    competitionScore,
    feasibilityScore,
    innovationScore,
    totalScore,
    successProbability
  };
};

const generateSmartFeedback = (text, scores) => {
  let feedback = '';

  if (scores.marketScore > 15) {
    feedback += 'The idea shows good market demand. ';
  } else {
    feedback += 'Market demand needs to be validated. ';
  }

  if (scores.innovationScore > 15) {
    feedback += 'It has strong innovation potential. ';
  } else {
    feedback += 'Consider adding unique features to stand out. ';
  }

  if (scores.feasibilityScore > 15) {
    feedback += 'The idea seems feasible to implement. ';
  } else {
    feedback += 'Execution complexity may be a challenge. ';
  }

  if (text.includes('students')) {
    feedback += 'The student segment could give you a clear early-adopter audience. ';
  }

  if (text.includes('ai') || text.includes('automation')) {
    feedback += 'Its automation angle strengthens the product story. ';
  }

  return feedback.trim();
};

const analyseIdea = async (title, description) => {
  const combinedText = `${title} ${description}`;
  const normalizedUserText = prepareComparableText(combinedText);
  const userKeywords = extractKeywords(combinedText);
  const adminIdeas = await AdminIdea.find();
  const advancedScores = analyzeIdea(description);

  if (!adminIdeas.length) {
    return {
      matchedIdea: 'No reference ideas available',
      similarityScore: 0,
      ...advancedScores,
      suggestion:
        'No admin reference ideas are available yet. Add more specifics about your users, the problem, and your revenue model.'
    };
  }

  let bestMatch = null;
  let highestScore = 0;
  let bestMatchedKeywords = [];

  adminIdeas.forEach((adminIdea) => {
    const referenceKeywords = getReferenceKeywords(adminIdea);
    const score = calculateAdvancedSimilarity(normalizedUserText, referenceKeywords);
    const matchedKeywords = referenceKeywords.filter((keyword) => userKeywords.includes(keyword));

    console.log('User Text:', normalizedUserText);
    console.log('Keywords:', adminIdea.keywords);
    console.log('Score:', score);

    if (score > highestScore) {
      highestScore = score;
      bestMatch = adminIdea;
      bestMatchedKeywords = matchedKeywords;
    }
  });

  return {
    matchedIdea: bestMatch ? bestMatch.title : 'No close match found',
    similarityScore: Math.round(highestScore),
    ...advancedScores,
    suggestion: buildSuggestion(bestMatch, bestMatchedKeywords, userKeywords)
  };
};

const ensureIdeaAnalysisUpToDate = async (idea) => {
  if (
    idea.analysisResult &&
    typeof idea.analysisResult.similarityScore === 'number' &&
    typeof idea.analysisResult.marketScore === 'number' &&
    typeof idea.analysisResult.competitionScore === 'number' &&
    typeof idea.analysisResult.feasibilityScore === 'number' &&
    typeof idea.analysisResult.innovationScore === 'number' &&
    typeof idea.analysisResult.totalScore === 'number' &&
    typeof idea.analysisResult.successProbability === 'number'
  ) {
    return idea;
  }

  idea.analysisResult = await analyseIdea(idea.title, idea.description);
  await idea.save();
  return idea;
};

const createIdea = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const analysisResult = await analyseIdea(title, description);

    const idea = await Idea.create({
      userId: req.user._id,
      title,
      description,
      analysisResult
    });

    return res.status(201).json({
      message: 'Idea submitted successfully.',
      idea
    });
  } catch (error) {
    next(error);
  }
};

const getIdeas = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const ideas = await Idea.find(query).sort({ createdAt: -1 }).populate('userId', 'name email');
    const refreshedIdeas = await Promise.all(ideas.map((idea) => ensureIdeaAnalysisUpToDate(idea)));

    return res.status(200).json(refreshedIdeas);
  } catch (error) {
    next(error);
  }
};

const getIdeaById = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id).populate('userId', 'name email');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    if (req.user.role !== 'admin' && String(idea.userId._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this idea.' });
    }

    const refreshedIdea = await ensureIdeaAnalysisUpToDate(idea);
    return res.status(200).json(refreshedIdea);
  } catch (error) {
    next(error);
  }
};

const getIdeaSWOT = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id).populate('userId', 'name email');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found.' });
    }

    if (req.user.role !== 'admin' && String(idea.userId._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this idea.' });
    }

    const refreshedIdea = await ensureIdeaAnalysisUpToDate(idea);
    const similarStartups = await findSimilarStartups(refreshedIdea.title, refreshedIdea.description);
    const similarCount = similarStartups.filter((item) => item.score > 30).length;
    let saturationLevel;

    if (similarCount >= 3) {
      saturationLevel = 'High Competition';
    } else if (similarCount === 2) {
      saturationLevel = 'Moderate Competition';
    } else {
      saturationLevel = 'Low Competition';
    }

    const smartFeedback = generateSmartFeedback(
      refreshedIdea.description.toLowerCase(),
      refreshedIdea.analysisResult
    );
    const swot = generateSWOT(refreshedIdea.description);

    return res.status(200).json({
      idea: refreshedIdea,
      matchedIdea: refreshedIdea.analysisResult?.matchedIdea || 'No close match found',
      similarityScore: refreshedIdea.analysisResult?.similarityScore ?? 0,
      similarStartups,
      saturationLevel,
      smartFeedback,
      swot
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIdea,
  getIdeas,
  getIdeaById,
  getIdeaSWOT,
  ensureIdeaAnalysisUpToDate,
  calculateAdvancedSimilarity,
  findSimilarStartups,
  generateSmartFeedback,
  generateSWOT,
  analyzeIdea,
  analyseIdea,
  extractKeywords
};
