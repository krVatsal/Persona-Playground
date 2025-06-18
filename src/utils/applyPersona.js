// Core utility for applying persona styles to Adobe Express elements

/**
 * Apply persona theme to the current Adobe Express document
 * @param {Object} persona - The persona object to apply
 * @param {Object} addOnUISdk - Adobe Express SDK instance
 * @returns {Promise<boolean>} Success status
 */
export async function applyPersonaToDocument(persona, addOnUISdk) {
  try {
    console.log('🎨 Applying persona:', persona.name);
    console.log('📋 Persona details:', persona);
    
    // Validate inputs
    if (!persona || !addOnUISdk) {
      console.error('❌ Missing persona or SDK');
      return false;
    }
    
    // Get document context
    const { document } = addOnUISdk.app;
    
    if (!document) {
      console.error('❌ No document available');
      return false;
    }
    
    let changesApplied = 0;
    
    // Apply theme colors
    console.log('🎨 Applying colors...');
    const colorSuccess = await applyPersonaColors(persona, document);
    if (colorSuccess) changesApplied++;
    
    // Apply fonts
    console.log('🔤 Applying fonts...');
    const fontSuccess = await applyPersonaFonts(persona, document);
    if (fontSuccess) changesApplied++;
    
    // Apply layout rules
    console.log('📐 Applying layout...');
    const layoutSuccess = await applyPersonaLayout(persona, document);
    if (layoutSuccess) changesApplied++;
    
    console.log(`✅ Persona applied successfully! ${changesApplied} changes made.`);
    return changesApplied > 0;
  } catch (error) {
    console.error('💥 Error applying persona:', error);
    return false;
  }
}

/**
 * Apply color palette from persona
 * @param {Object} persona 
 * @param {Object} document 
 */
async function applyPersonaColors(persona, document) {
  if (!persona.theme?.colors) return;
  
  try {
    const colors = persona.theme.colors;
    
    // Apply background color if available
    if (colors.background) {
      await document.setBackgroundColor({
        red: hexToRgb(colors.background).r / 255,
        green: hexToRgb(colors.background).g / 255,
        blue: hexToRgb(colors.background).b / 255,
        alpha: 1
      });
    }
    
    // Get all text elements and apply persona colors
    const elements = await document.getElements();
    for (const element of elements) {
      if (element.type === 'text') {
        await element.setTextColor({
          red: hexToRgb(colors.text || colors.primary).r / 255,
          green: hexToRgb(colors.text || colors.primary).g / 255,
          blue: hexToRgb(colors.text || colors.primary).b / 255,
          alpha: 1
        });
      }
    }
  } catch (error) {
    console.warn('Could not apply colors:', error);
  }
}

/**
 * Apply fonts from persona
 * @param {Object} persona 
 * @param {Object} document 
 */
async function applyPersonaFonts(persona, document) {
  if (!persona.theme?.fonts) return;
  
  try {
    const fonts = persona.theme.fonts;
    const elements = await document.getElements();
    
    for (const element of elements) {
      if (element.type === 'text') {
        // Apply heading font to larger text, body font to smaller text
        const fontSize = await element.getFontSize();
        const fontFamily = fontSize > 18 ? fonts.heading : fonts.body;
        
        if (fontFamily) {
          await element.setFontFamily(fontFamily);
        }
      }
    }
  } catch (error) {
    console.warn('Could not apply fonts:', error);
  }
}

/**
 * Apply layout rules from persona
 * @param {Object} persona 
 * @param {Object} document 
 */
async function applyPersonaLayout(persona, document) {
  if (!persona.layoutRules) return;
  
  try {
    const rules = persona.layoutRules;
    const elements = await document.getElements();
    
    // Apply alignment rules
    if (rules.alignment) {
      for (const element of elements) {
        switch (rules.alignment) {
          case 'center':
            await element.setAlignment('center');
            break;
          case 'playful':
            // Slightly offset elements for playful look
            const currentBounds = await element.getBounds();
            await element.setBounds({
              ...currentBounds,
              x: currentBounds.x + (Math.random() - 0.5) * 10
            });
            break;
          case 'chaotic':
            // Random positioning for punk aesthetic
            const bounds = await element.getBounds();
            await element.setBounds({
              ...bounds,
              rotation: (Math.random() - 0.5) * 10 // Slight rotation
            });
            break;
        }
      }
    }
  } catch (error) {
    console.warn('Could not apply layout rules:', error);
  }
}

/**
 * Convert hex color to RGB object
 * @param {string} hex 
 * @returns {Object} RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Preview persona styles (for UI preview)
 * @param {Object} persona 
 * @returns {Object} Style object for React components
 */
export function getPersonaPreviewStyles(persona) {
  if (!persona?.theme?.colors) return {};
  
  return {
    backgroundColor: persona.theme.colors.background,
    color: persona.theme.colors.text,
    fontFamily: persona.theme.fonts?.heading || 'inherit',
    '--primary-color': persona.theme.colors.primary,
    '--secondary-color': persona.theme.colors.secondary,
    '--accent-color': persona.theme.colors.accent
  };
}

// Add a demo mode for testing
const DEMO_MODE = !addOnUISdk || !addOnUISdk.app || !addOnUISdk.app.document;

if (DEMO_MODE) {
  console.log('🧪 Demo mode: Simulating persona application...');
  
  // Simulate the persona application process
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
  
  console.log('📋 Would apply the following changes:');
  console.log('- Background color:', persona.theme?.colors?.background);
  console.log('- Text color:', persona.theme?.colors?.text);
  console.log('- Primary color:', persona.theme?.colors?.primary);
  console.log('- Heading font:', persona.theme?.fonts?.heading);
  console.log('- Body font:', persona.theme?.fonts?.body);
  console.log('- Stickers:', persona.theme?.stickers?.join(', '));
  
  console.log('✅ Demo: Persona would be applied successfully!');
  return true;
}