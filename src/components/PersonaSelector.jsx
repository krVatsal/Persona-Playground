import React, { useState, useEffect } from 'react';
import { Button } from '@swc-react/button';
import { Picker } from '@swc-react/picker';
import { MenuItem } from '@swc-react/menu';
import { loadAllPersonas, getPersonaById } from '../utils/personaParser';
import { getPersonaPreviewStyles } from '../utils/applyPersona';

const PersonaSelector = ({ onPersonaSelect, onApplyPersona, selectedPersonaId }) => {
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadPersonas();
  }, []);

  useEffect(() => {
    if (selectedPersonaId) {
      loadSelectedPersona(selectedPersonaId);
    }
  }, [selectedPersonaId]);

  const loadPersonas = async () => {
    try {
      const personaList = await loadAllPersonas();
      console.log('Loaded personas:', personaList); // Debug log
      setPersonas(personaList);
    } catch (error) {
      console.error('Error loading personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedPersona = async (personaId) => {
    try {
      const persona = await getPersonaById(personaId);
      console.log('Loaded selected persona:', persona); // Debug log
      setSelectedPersona(persona);
    } catch (error) {
      console.error('Error loading selected persona:', error);
    }
  };

  const handlePersonaChange = async (personaId) => {
    console.log('Persona changed to:', personaId); // Debug log
    const persona = await getPersonaById(personaId);
    setSelectedPersona(persona);
    onPersonaSelect(persona);
  };

  const handleApply = async () => {
    if (!selectedPersona) return;
    
    setApplying(true);
    try {
      await onApplyPersona(selectedPersona);
    } catch (error) {
      console.error('Error applying persona:', error);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="persona-selector loading">Loading personas...</div>;
  }

  return (
    <div className="persona-selector">
      <h3>Choose a Persona</h3>
      
      {/* Debug info */}
      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#666' }}>
        Loaded {personas.length} personas. Selected: {selectedPersona?.name || 'None'}
      </div>
      
      <div className="persona-dropdown">
        <Picker
          label="Select Persona"
          value={selectedPersona?.id || ''}
          onSelectionChange={handlePersonaChange}
        >
          {personas.map(persona => (
            <MenuItem key={persona.id} textValue={persona.name}>
              <span className="persona-menu-item">
                <span className="persona-avatar">{persona.avatar}</span>
                <span className="persona-name">{persona.name}</span>
              </span>
            </MenuItem>
          ))}
        </Picker>
      </div>

      {/* Fallback buttons for testing */}
      <div className="persona-quick-select" style={{ marginBottom: '16px' }}>
        <h4>Quick Select (for testing):</h4>
        {personas.map(persona => (
          <button 
            key={persona.id}
            onClick={() => handlePersonaChange(persona.id)}
            style={{ 
              margin: '4px', 
              padding: '8px', 
              backgroundColor: selectedPersona?.id === persona.id ? '#0066cc' : '#f0f0f0',
              color: selectedPersona?.id === persona.id ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {persona.avatar} {persona.name}
          </button>
        ))}
      </div>

      {selectedPersona && (
        <>
          <div className="persona-preview">
            <div 
              className="persona-preview-card"
              style={getPersonaPreviewStyles ? getPersonaPreviewStyles(selectedPersona) : {}}
            >
              <div className="persona-header">
                <span className="persona-avatar-large">{selectedPersona.avatar}</span>
                <div className="persona-info">
                  <h4>{selectedPersona.name}</h4>
                  <p>{selectedPersona.description}</p>
                </div>
              </div>
              
              <div className="persona-colors">
                <div className="color-palette">
                  {Object.entries(selectedPersona.theme?.colors || {}).map(([name, color]) => (
                    <div
                      key={name}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      title={`${name}: ${color}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="persona-fonts">
                <div className="font-preview">
                  {selectedPersona.theme?.fonts?.heading && (
                    <div 
                      className="font-sample heading"
                      style={{ fontFamily: selectedPersona.theme.fonts.heading }}
                    >
                      Heading Font
                    </div>
                  )}
                  {selectedPersona.theme?.fonts?.body && (
                    <div 
                      className="font-sample body"
                      style={{ fontFamily: selectedPersona.theme.fonts.body }}
                    >
                      Body Font
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="persona-actions">
            <Button
              variant="accent"
              size="m"
              onClick={handleApply}
              disabled={applying}
              className="apply-button"
            >
              {applying ? 'Applying...' : 'Apply Persona'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PersonaSelector;