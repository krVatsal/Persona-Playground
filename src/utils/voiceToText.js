// Voice recognition and mood analysis utilities

/**
 * Initialize speech recognition
 * @returns {SpeechRecognition|null} Speech recognition instance or null if not supported
 */
export function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported in this browser');
    return null;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  
  return recognition;
}

/**
 * Start voice recognition and return promise with result
 * @returns {Promise<string>} Recognized text
 */
export function startVoiceRecognition() {
  return new Promise((resolve, reject) => {
    const recognition = initSpeechRecognition();
    
    if (!recognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }
    
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      resolve(result);
    };
    
    recognition.onerror = (event) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };
    
    recognition.onend = () => {
      // Recognition ended
    };
    
    recognition.start();
  });
}

/**
 * Analyze mood/intent from text input
 * @param {string} text - Input text to analyze
 * @returns {Object} Analysis result with mood, keywords, and confidence
 */
export function analyzeMoodFromText(text) {
  const lowercaseText = text.toLowerCase();
  
  // Define mood patterns
  const moodPatterns = {
    'kawaii-artist': {
      keywords: ['cute', 'kawaii', 'anime', 'colorful', 'sweet', 'adorable', 'playful', 'pastel', 'soft'],
      phrases: ['make it cute', 'anime style', 'kawaii', 'colorful and sweet', 'adorable design']
    },
    'zine-punk': {
      keywords: ['punk', 'grunge', 'rebellious', 'raw', 'edgy', 'vintage', 'sarcastic', 'rough', 'DIY'],
      phrases: ['make it punk', 'grunge style', 'rebellious', 'raw and edgy', 'vintage and sarcastic']
    },
    'futurist-ui': {
      keywords: ['tech', 'futuristic', 'minimal', 'sci-fi', 'modern', 'digital', 'clean', 'geometric'],
      phrases: ['make it futuristic', 'tech style', 'minimal and modern', 'sci-fi design', 'digital and clean']
    }
  };
  
  const results = {};
  
  // Calculate confidence scores for each persona
  Object.keys(moodPatterns).forEach(personaId => {
    const pattern = moodPatterns[personaId];
    let score = 0;
    
    // Check for keyword matches
    pattern.keywords.forEach(keyword => {
      if (lowercaseText.includes(keyword)) {
        score += 2;
      }
    });
    
    // Check for phrase matches (higher weight)
    pattern.phrases.forEach(phrase => {
      if (lowercaseText.includes(phrase)) {
        score += 5;
      }
    });
    
    results[personaId] = score;
  });
  
  // Find the best match
  const bestMatch = Object.keys(results).reduce((a, b) => 
    results[a] > results[b] ? a : b
  );
  
  const maxScore = Math.max(...Object.values(results));
  const confidence = maxScore > 0 ? Math.min(maxScore / 10, 1) : 0;
  
  return {
    bestMatch: maxScore > 0 ? bestMatch : null,
    confidence,
    allScores: results,
    originalText: text,
    extractedKeywords: extractKeywords(lowercaseText)
  };
}

/**
 * Extract potential keywords from text
 * @param {string} text 
 * @returns {Array<string>} Extracted keywords
 */
function extractKeywords(text) {
  // Simple keyword extraction - remove common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'it', 'is', 'are', 'was', 'were', 'make', 'turn', 'into'];
  
  return text
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10); // Limit to 10 keywords
}

/**
 * Get mood suggestions based on partial input
 * @param {string} partialText 
 * @returns {Array<string>} Suggested completions
 */
export function getMoodSuggestions(partialText) {
  const suggestions = [
    'Make this vintage and sarcastic',
    'Turn this into a cute anime-style banner',
    'Make it futuristic and minimal',
    'Give it a punk rock aesthetic',
    'Make it kawaii and colorful',
    'Turn this into a sci-fi design',
    'Make it grunge and rebellious',
    'Give it a digital tech vibe'
  ];
  
  if (!partialText) return suggestions;
  
  const filtered = suggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(partialText.toLowerCase())
  );
  
  return filtered.length > 0 ? filtered : suggestions;
}