// shared/quality-score.js - Pre-optimization prompt quality analysis

/**
 * Calculate prompt quality score (1-10)
 * Based on clarity, specificity, structure, and actionability
 */
function calculateQualityScore(text) {
  if (!text || !text.trim()) {
    return {
      overall: 0,
      clarity: 0,
      specificity: 0,
      structure: 0,
      actionability: 0,
      suggestions: ['Please enter some text to analyze.']
    };
  }

  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).length;
  const sentenceCount = (trimmed.match(/[.!?]+/g) || []).length || 1;
  const avgWordLength = trimmed.replace(/\s+/g, '').length / wordCount;
  
  // Clarity Score (0-10)
  let clarity = 5;
  
  // Bonus for reasonable length
  if (wordCount >= 10 && wordCount <= 100) clarity += 2;
  else if (wordCount > 100) clarity += 1;
  else if (wordCount < 5) clarity -= 2;
  
  // Bonus for proper sentence structure
  if (sentenceCount > 0 && /^[A-Z]/.test(trimmed)) clarity += 1;
  
  // Penalty for excessive question marks or exclamations
  const excessivePunctuation = (trimmed.match(/[!?]{2,}/g) || []).length;
  if (excessivePunctuation > 0) clarity -= 1;
  
  // Bonus for clear language (longer average word length suggests more specific terms)
  if (avgWordLength > 5) clarity += 1;
  
  clarity = Math.max(0, Math.min(10, clarity));

  // Specificity Score (0-10)
  let specificity = 5;
  
  // Check for specific terms
  const specificTerms = /\b(specific|exactly|precisely|detailed|comprehensive|must|should|need|want|require)\b/gi;
  const specificMatches = (trimmed.match(specificTerms) || []).length;
  specificity += Math.min(3, specificMatches);
  
  // Check for vague terms (penalty)
  const vagueTerms = /\b(something|anything|stuff|things|maybe|perhaps|kind of|sort of)\b/gi;
  const vagueMatches = (trimmed.match(vagueTerms) || []).length;
  specificity -= vagueMatches;
  
  // Check for numbers/quantities
  if (/\d+/.test(trimmed)) specificity += 1;
  
  // Check for examples
  if (/\b(example|such as|like|including|e\.g\.|for instance)\b/i.test(trimmed)) {
    specificity += 1;
  }
  
  specificity = Math.max(0, Math.min(10, specificity));

  // Structure Score (0-10)
  let structure = 5;
  
  // Check for clear sections or organization
  if (/\n\n/.test(text)) structure += 1; // Paragraphs
  if (/[-•*]\s/.test(text)) structure += 1; // Lists
  if (/\d+\.\s/.test(text)) structure += 1; // Numbered lists
  if (/(^|\n)#+ /.test(text)) structure += 1; // Headers
  
  // Check for role/task/context keywords
  const structureKeywords = /\b(role|task|context|format|constraint|goal|objective|purpose|output|input)\b/gi;
  const structureMatches = (trimmed.match(structureKeywords) || []).length;
  structure += Math.min(2, structureMatches);
  
  // Bonus for complete sentences
  if (sentenceCount > 1) structure += 1;
  
  structure = Math.max(0, Math.min(10, structure));

  // Actionability Score (0-10)
  let actionability = 5;
  
  // Check for action verbs
  const actionVerbs = /\b(write|create|generate|explain|describe|analyze|compare|list|summarize|draft|design|build|develop)\b/gi;
  const actionMatches = (trimmed.match(actionVerbs) || []).length;
  actionability += Math.min(3, actionMatches);
  
  // Check for clear imperatives
  if (/^(write|create|generate|make|give|show|tell|explain)/i.test(trimmed)) {
    actionability += 1;
  }
  
  // Penalty for questions without context
  if (/^\?/.test(trimmed) || (trimmed.includes('?') && wordCount < 10)) {
    actionability -= 1;
  }
  
  actionability = Math.max(0, Math.min(10, actionability));

  // Overall Score (weighted average)
  const overall = Math.round(
    (clarity * 0.25 + specificity * 0.3 + structure * 0.25 + actionability * 0.2)
  );

  // Generate suggestions
  const suggestions = [];
  
  if (clarity < 6) {
    suggestions.push('💡 Try to write in complete, clear sentences');
  }
  if (specificity < 6) {
    suggestions.push('💡 Add more specific details about what you want');
  }
  if (structure < 6) {
    suggestions.push('💡 Organize your prompt with clear sections or bullet points');
  }
  if (actionability < 6) {
    suggestions.push('💡 Start with a clear action verb (write, create, explain, etc.)');
  }
  if (wordCount < 10) {
    suggestions.push('💡 Provide more context to get better results');
  }
  if (overall >= 8) {
    suggestions.push('✨ Great prompt! UPO will make it even better.');
  }

  return {
    overall: Math.max(1, overall), // Minimum 1
    clarity: Math.round(clarity),
    specificity: Math.round(specificity),
    structure: Math.round(structure),
    actionability: Math.round(actionability),
    suggestions,
    wordCount,
    charCount: trimmed.length
  };
}

/**
 * Get quality score color based on score
 */
function getScoreColor(score) {
  if (score >= 8) return '#10b981'; // Green
  if (score >= 6) return '#f59e0b'; // Orange
  if (score >= 4) return '#ef4444'; // Red
  return '#6b7280'; // Gray
}

/**
 * Get quality score label
 */
function getScoreLabel(score) {
  if (score >= 9) return 'Excellent';
  if (score >= 8) return 'Great';
  if (score >= 7) return 'Good';
  if (score >= 6) return 'Fair';
  if (score >= 4) return 'Needs Work';
  return 'Poor';
}

/**
 * Format score for display
 */
function formatScore(scoreData) {
  return {
    ...scoreData,
    color: getScoreColor(scoreData.overall),
    label: getScoreLabel(scoreData.overall),
    percentage: scoreData.overall * 10
  };
}

// Export for ES6 module usage
export {
  calculateQualityScore,
  getScoreColor,
  getScoreLabel,
  formatScore
};
