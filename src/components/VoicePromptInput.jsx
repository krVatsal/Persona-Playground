import React, { useState } from 'react';
import { Button } from '@swc-react/button';
import { TextField } from '@swc-react/textfield';
import { startVoiceRecognition } from '../utils/voiceToText';

const VoicePromptInput = ({ onTextChange, onVoiceResult, value = '', placeholder = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  const handleVoiceInput = async () => {
    setIsListening(true);
    setError('');
    
    try {
      const recognizedText = await startVoiceRecognition();
      onTextChange(recognizedText);
      if (onVoiceResult) {
        onVoiceResult(recognizedText);
      }
    } catch (error) {
      setError(`Voice recognition failed: ${error.message}`);
      console.error('Voice recognition error:', error);
    } finally {
      setIsListening(false);
    }
  };

  const handleTextInput = (newValue) => {
    setError('');
    onTextChange(newValue);
  };

  return (
    <div className="voice-prompt-input">
      <div className="input-group">
        <TextField
          label="Text or Voice Input"
          value={value}
          onInput={(e) => handleTextInput(e.target.value)}
          placeholder={placeholder}
          multiline
          rows={2}
        />
        
        <Button
          variant={isListening ? 'negative' : 'secondary'}
          onClick={handleVoiceInput}
          disabled={isListening}
          className="voice-button"
          title="Click to start voice input"
        >
          {isListening ? '🎤 Listening...' : '🎤 Voice'}
        </Button>
      </div>
      
      {error && (
        <div className="voice-error">
          {error}
        </div>
      )}
      
      {isListening && (
        <div className="voice-status">
          <div className="listening-indicator">
            <div className="pulse"></div>
            <span>Listening for your voice...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicePromptInput;