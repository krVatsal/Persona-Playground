// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import { Tabs, Tab, TabPanel } from "@swc-react/tabs";
import React, { useState } from "react";
import "./App.css";

// Import our custom components
import PersonaSelector from "./PersonaSelector";
import MoodShiftPanel from "./MoodShiftPanel";
import { applyPersonaToDocument } from "../utils/applyPersona";

const App = ({ addOnUISdk }) => {
    const [selectedPersona, setSelectedPersona] = useState(null);
    const [appliedPersonas, setAppliedPersonas] = useState([]);
    const [isApplying, setIsApplying] = useState(false);

    const handlePersonaSelect = (persona) => {
        setSelectedPersona(persona);
        console.log('Selected persona:', persona);
    };

    const handleApplyPersona = async (persona) => {
        if (!persona) return;
        
        setIsApplying(true);
        console.log('🎨 Starting to apply persona:', persona.name);
        
        try {
            const success = await applyPersonaToDocument(persona, addOnUISdk);
            if (success) {
                // Track applied personas for badge system
                const newApplied = [...appliedPersonas];
                if (!newApplied.find(p => p.id === persona.id)) {
                    newApplied.push(persona);
                    setAppliedPersonas(newApplied);
                    localStorage.setItem('appliedPersonas', JSON.stringify(newApplied));
                }
                
                console.log('✅ Persona applied successfully:', persona.name);
                
                // Show success feedback (you could replace this with a toast notification)
                if (typeof window !== 'undefined') {
                    // Temporary success indication
                    const successMsg = document.createElement('div');
                    successMsg.innerHTML = `🎉 ${persona.name} applied successfully!`;
                    successMsg.style.cssText = `
                        position: fixed; top: 20px; right: 20px; 
                        background: #4CAF50; color: white; padding: 12px 20px; 
                        border-radius: 8px; font-weight: bold; z-index: 10000;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    `;
                    document.body.appendChild(successMsg);
                    setTimeout(() => successMsg.remove(), 3000);
                }
            } else {
                console.error('❌ Failed to apply persona');
                // Show error feedback
                if (typeof window !== 'undefined') {
                    const errorMsg = document.createElement('div');
                    errorMsg.innerHTML = `❌ Failed to apply ${persona.name}`;
                    errorMsg.style.cssText = `
                        position: fixed; top: 20px; right: 20px; 
                        background: #f44336; color: white; padding: 12px 20px; 
                        border-radius: 8px; font-weight: bold; z-index: 10000;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    `;
                    document.body.appendChild(errorMsg);
                    setTimeout(() => errorMsg.remove(), 3000);
                }
            }
        } catch (error) {
            console.error('💥 Error applying persona:', error);
        } finally {
            setIsApplying(false);
        }
    };

    const handlePersonaDetected = (persona, analysis) => {
        console.log('Persona detected from mood:', persona, analysis);
        setSelectedPersona(persona);
    };

    // Load applied personas from localStorage on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('appliedPersonas');
        if (saved) {
            try {
                setAppliedPersonas(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading applied personas:', error);
            }
        }
    }, []);

    return (
        // Please note that the below "<Theme>" component does not react to theme changes in Express.
        // You may use "addOnUISdk.app.ui.theme" to get the current theme and react accordingly.
        <Theme system="express" scale="medium" color="light">
            <div className="persona-playground-app">
                <header className="app-header">
                    <h1>🎭 Persona Playground</h1>
                    <p>Transform your design with creative personas</p>
                </header>

                <Tabs selected="personas">
                    <Tab value="personas">Personas</Tab>
                    <Tab value="mood">Mood Prompt</Tab>
                    <Tab value="badges">Badges</Tab>
                    
                    <TabPanel value="personas">
                            <PersonaSelector
                                onPersonaSelect={handlePersonaSelect}
                                onApplyPersona={handleApplyPersona}
                                selectedPersonaId={selectedPersona?.id}
                            />
                        </TabPanel>
                        
                        <TabPanel value="mood">
                            <MoodShiftPanel
                                onPersonaDetected={handlePersonaDetected}
                                onApplyPersona={handleApplyPersona}
                            />
                        </TabPanel>
                        
                        <TabPanel value="badges">
                            <div className="badges-panel">
                                <h3>Your Achievements</h3>
                                <div className="stats">
                                    <div className="stat-item">
                                        <span className="stat-number">{appliedPersonas.length}</span>
                                        <span className="stat-label">Personas Used</span>
                                    </div>
                                </div>
                                
                                <div className="badges-grid">
                                    {appliedPersonas.length >= 1 && (
                                        <div className="badge earned">
                                            <span className="badge-icon">🎨</span>
                                            <span className="badge-name">First Style</span>
                                            <span className="badge-desc">Applied your first persona</span>
                                        </div>
                                    )}
                                    
                                    {appliedPersonas.length >= 3 && (
                                        <div className="badge earned">
                                            <span className="badge-icon">🌈</span>
                                            <span className="badge-name">Style Explorer</span>
                                            <span className="badge-desc">Used 3 different personas</span>
                                        </div>
                                    )}
                                    
                                    {appliedPersonas.length < 1 && (
                                        <div className="badge locked">
                                            <span className="badge-icon">🎨</span>
                                            <span className="badge-name">First Style</span>
                                            <span className="badge-desc">Apply your first persona</span>
                                        </div>
                                    )}
                                    
                                    {appliedPersonas.length < 3 && (
                                        <div className="badge locked">
                                            <span className="badge-icon">🌈</span>
                                            <span className="badge-name">Style Explorer</span>
                                            <span className="badge-desc">Use 3 different personas</span>
                                        </div>
                                    )}
                                </div>
                                
                                {appliedPersonas.length > 0 && (
                                    <div className="used-personas">
                                        <h4>Personas You've Used:</h4>
                                        <div className="persona-chips">
                                            {appliedPersonas.map(persona => (
                                                <div key={persona.id} className="persona-chip">
                                                    <span className="chip-avatar">{persona.avatar}</span>
                                                    <span className="chip-name">{persona.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabPanel>
                </Tabs>

                {isApplying && (
                    <div className="applying-overlay">
                        <div className="applying-message">
                            🎨 Applying persona...
                        </div>
                    </div>
                )}
            </div>
        </Theme>
    );
};

export default App;
