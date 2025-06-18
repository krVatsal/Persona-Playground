// Utility functions for parsing and working with persona data

// Import persona data directly
import futuristUIData from '../personas/futuristUI.json';
import kawaiiArtistData from '../personas/kawaiiArtist.json';
import zinePunkData from '../personas/zinePunk.json';

/**
 * Load all available personas from the personas directory
 * @returns {Promise<Array>} Array of persona objects
 */
export async function loadAllPersonas() {
  try {
    return [
      futuristUIData,
      kawaiiArtistData,
      zinePunkData
    ];
  } catch (error) {
    console.error('Error loading personas:', error);
    return [];
  }
}

/**
 * Find persona by ID
 * @param {string} personaId 
 * @returns {Promise<Object|null>} Persona object or null if not found
 */
export async function getPersonaById(personaId) {
  const personas = await loadAllPersonas();
  return personas.find(persona => persona.id === personaId) || null;
}

/**
 * Search personas by keywords
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching personas
 */
export async function searchPersonasByKeywords(query) {
  const personas = await loadAllPersonas();
  const searchTerms = query.toLowerCase().split(' ');
  
  return personas.filter(persona => {
    const keywords = persona.keywords || [];
    const searchableText = [
      persona.name,
      persona.description,
      ...keywords
    ].join(' ').toLowerCase();
    
    return searchTerms.some(term => searchableText.includes(term));
  });
}

/**
 * Get CSS variables from persona theme
 * @param {Object} persona 
 * @returns {Object} CSS custom properties object
 */
export function getPersonaCSSVariables(persona) {
  if (!persona?.theme?.colors) return {};
  
  const cssVars = {};
  const colors = persona.theme.colors;
  
  Object.keys(colors).forEach(colorKey => {
    cssVars[`--persona-${colorKey}`] = colors[colorKey];
  });
  
  if (persona.theme.fonts) {
    Object.keys(persona.theme.fonts).forEach(fontKey => {
      cssVars[`--persona-font-${fontKey}`] = persona.theme.fonts[fontKey];
    });
  }
  
  return cssVars;
}