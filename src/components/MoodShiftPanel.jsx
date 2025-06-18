import React, { useState } from 'react';
import { Button } from '@swc-react/button';
import { Textfield } from '@swc-react/textfield';
import { ActionButton } from '@swc-react/action-button';
import { startVoiceRecognition, analyzeMoodFromText, getMoodSuggestions } from '../utils/voiceToText';
import { getPersonaById } from '../utils/personaParser';

const MoodShiftPanel = ({ onPersonaDetected, onApplyPersona }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  const handleTextChange = (value) => {
    setInputText(value);
    setError('');
    
    // Show suggestions as user types
    if (value.length > 2) {
      const newSuggestions = getMoodSuggestions(value);
      setSuggestions(newSuggestions.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    setError('');
    
    try {
      const recognizedText = await startVoiceRecognition();
      setInputText(recognizedText);
      await analyzeMood(recognizedText);
    } catch (error) {
      setError(`Voice recognition error: ${error.message}`);
      console.error('Voice recognition error:', error);
    } finally {
      setIsListening(false);
    }
  };

  const analyzeMood = async (text = inputText) => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const analysis = analyzeMoodFromText(text);
      setMoodResult(analysis);
      
      if (analysis.bestMatch && analysis.confidence > 0.3) {
        const persona = await getPersonaById(analysis.bestMatch);
        if (persona) {
          onPersonaDetected(persona, analysis);
        }
      } else {
        setError('Could not detect a clear mood/style from your input. Try being more specific!');
      }
    } catch (error) {
      setError('Error analyzing mood');
      console.error('Mood analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    setSuggestions([]);
    analyzeMood(suggestion);
  };

  const handleApplyDetectedPersona = async () => {
    if (moodResult?.bestMatch) {
      const persona = await getPersonaById(moodResult.bestMatch);
      if (persona) {
        onApplyPersona(persona);
      }
    }
  };

  const clearResults = () => {
    setInputText('');
    setMoodResult(null);
    setSuggestions([]);
    setError('');
  };

  return (
    <div className="mood-shift-panel">
      <h3>Mood Prompt</h3>
      <p className="mood-description">
        Describe how you want your design to feel, and I'll find the perfect persona!
      </p>

      <div className="mood-input-section">
        <div className="input-group">
          <Textfield
            label="Describe your desired mood or style"
            value={inputText}
            onInput={(e) => handleTextChange(e.target.value)}
            placeholder="e.g., 'Make this vintage and sarcastic' or 'Turn this into a cute anime-style banner'"
            multiline
            rows={3}
          />
          
          <div className="input-actions">
            <ActionButton
              onClick={handleVoiceInput}
              disabled={isListening}
              title="Use voice input"
            >
              {isListening ? '🎤 Listening...' : '🎤 Voice'}
            </ActionButton>
            
            <Button
              variant="primary"
              onClick={() => analyzeMood()}
              disabled={analyzing || !inputText.trim()}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Mood'}
            </Button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions">
            <p className="suggestions-label">Try these:</p>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {moodResult && (
        <div className="mood-result">
          <div className="result-header">
            <h4>Mood Analysis Results</h4>
            <button className="clear-button" onClick={clearResults}>×</button>
          </div>
          
          {moodResult.bestMatch ? (
            <div className="detected-persona">
              <div className="confidence-bar">
                <div className="confidence-label">
                  Confidence: {Math.round(moodResult.confidence * 100)}%
                </div>
                <div className="confidence-meter">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${moodResult.confidence * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="persona-match">
                <p>
                  <strong>Detected Style:</strong> {moodResult.bestMatch.replace('-', ' ')}
                </p>
                
                {moodResult.extractedKeywords.length > 0 && (
                  <div className="extracted-keywords">
                    <strong>Key themes:</strong> {moodResult.extractedKeywords.join(', ')}
                  </div>
                )}
              </div>
              
              <Button
                variant="accent"
                size="m"
                onClick={handleApplyDetectedPersona}
                className="apply-detected-button"
              >
                Apply This Style
              </Button>
            </div>
          ) : (
            <div className="no-match">
              <p>No clear style detected. Try being more specific or use different keywords!</p>
              <div className="all-scores">
                <strong>Confidence scores:</strong>
                <ul>
                  {Object.entries(moodResult.allScores).map(([persona, score]) => (
                    <li key={persona}>
                      {persona.replace('-', ' ')}: {score}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mood-examples">
        <details>
          <summary>Example prompts</summary>
          <ul>
            <li>"Make this cute and colorful like anime"</li>
            <li>"Give it a rebellious punk rock vibe"</li>
            <li>"Turn this into a futuristic tech design"</li>
            <li>"Make it vintage and sarcastic"</li>
            <li>"I want kawaii pastel colors"</li>
            <li>"Give it a raw, DIY aesthetic"</li>
          </ul>
        </details>
      </div>
    </div>
  );
};

export default MoodShiftPanel;