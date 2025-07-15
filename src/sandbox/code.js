import { editor } from "express-document-sdk";
import addOnSandboxSdk from "add-on-sdk-document-sandbox";

// Add debugging to see if sandbox is loading
console.log("🚀 Document sandbox starting to load...");
console.log("addOnSandboxSdk:", addOnSandboxSdk);
console.log("addOnSandboxSdk.instance:", addOnSandboxSdk.instance);

const { runtime } = addOnSandboxSdk.instance;
console.log("✅ Got runtime from sandbox:", runtime);
console.log("Runtime methods:", Object.keys(runtime));

// Store snapshots in memory (in a real app, you might want to persist these)
let snapshots = [];

console.log("📋 About to expose sandbox APIs...");

/**
 * Save a snapshot of the current document state
 * @param {string} name - The name for the snapshot
 * @returns {Promise<Object>} The saved snapshot data
 */
runtime.exposeApi("saveSnapshot", async (name) => {
    try {
        // Get the current document
        const document = editor.context.document;
        
        if (!document) {
            throw new Error("No document available");
        }

        // Create a serializable representation of the document
        const artboards = [];
        
        // Iterate through all artboards
        for (let i = 0; i < document.artboards.length; i++) {
            const artboard = document.artboards[i];
            const artboardData = {
                id: artboard.id,
                name: artboard.name || `Artboard ${i + 1}`,
                width: artboard.width,
                height: artboard.height,
                elements: []
            };

            // Serialize elements on the artboard
            for (let j = 0; j < artboard.children.length; j++) {
                const element = artboard.children[j];
                const elementData = await serializeElement(element);
                artboardData.elements.push(elementData);
            }
            
            artboards.push(artboardData);
        }

        const snapshot = {
            id: Date.now().toString(),
            name: name || `Snapshot ${snapshots.length + 1}`,
            timestamp: new Date().toISOString(),
            artboards: artboards,
            documentData: {
                title: document.title || "Untitled Document"
            }
        };

        snapshots.push(snapshot);
        
        console.log(`Snapshot "${snapshot.name}" saved successfully`);
        return {
            success: true,
            snapshot: {
                id: snapshot.id,
                name: snapshot.name,
                timestamp: snapshot.timestamp
            }
        };
    } catch (error) {
        console.error("Error saving snapshot:", error);
        return {
            success: false,
            error: error.message
        };
    }
});

/**
 * Get the list of all saved snapshots
 * @returns {Promise<Array>} Array of snapshot metadata
 */
runtime.exposeApi("listSnapshots", async () => {
    try {
        return {
            success: true,
            snapshots: snapshots.map(snapshot => ({
                id: snapshot.id,
                name: snapshot.name,
                timestamp: snapshot.timestamp
            }))
        };
    } catch (error) {
        console.error("Error listing snapshots:", error);
        return {
            success: false,
            error: error.message,
            snapshots: []
        };
    }
});

/**
 * Restore a snapshot by its index
 * @param {number} index - The index of the snapshot to restore
 * @returns {Promise<Object>} Result of the restore operation
 */
runtime.exposeApi("restoreSnapshot", async (index) => {
    try {
        if (index < 0 || index >= snapshots.length) {
            throw new Error("Invalid snapshot index");
        }

        const snapshot = snapshots[index];
        const document = editor.context.document;
        
        if (!document) {
            throw new Error("No document available");
        }

        // Clear existing content
        while (document.artboards.length > 0) {
            document.artboards[0].removeFromParent();
        }

        // Restore artboards and elements
        for (const artboardData of snapshot.artboards) {
            const artboard = editor.createArtboard();
            artboard.name = artboardData.name;
            artboard.width = artboardData.width;
            artboard.height = artboardData.height;
            
            document.artboards.append(artboard);

            // Restore elements
            for (const elementData of artboardData.elements) {
                try {
                    const element = await deserializeElement(elementData);
                    if (element) {
                        artboard.children.append(element);
                    }
                } catch (elementError) {
                    console.warn("Failed to restore element:", elementError);
                }
            }
        }

        console.log(`Snapshot "${snapshot.name}" restored successfully`);
        return {
            success: true,
            message: `Restored snapshot: ${snapshot.name}`
        };
    } catch (error) {
        console.error("Error restoring snapshot:", error);
        return {
            success: false,
            error: error.message
        };
    }
});

/**
 * Delete a snapshot by its index
 * @param {number} index - The index of the snapshot to delete
 * @returns {Promise<Object>} Result of the delete operation
 */
runtime.exposeApi("deleteSnapshot", async (index) => {
    try {
        if (index < 0 || index >= snapshots.length) {
            throw new Error("Invalid snapshot index");
        }

        const deletedSnapshot = snapshots.splice(index, 1)[0];
        
        console.log(`Snapshot "${deletedSnapshot.name}" deleted successfully`);
        return {
            success: true,
            message: `Deleted snapshot: ${deletedSnapshot.name}`
        };
    } catch (error) {
        console.error("Error deleting snapshot:", error);
        return {
            success: false,
            error: error.message
        };
    }
});

/**
 * Serialize an element to a JSON-compatible format
 * @param {*} element - The element to serialize
 * @returns {Promise<Object>} Serialized element data
 */
async function serializeElement(element) {
    const baseData = {
        type: element.constructor.name,
        id: element.id || null,
        name: element.name || null,
        x: element.boundsInParent?.x || 0,
        y: element.boundsInParent?.y || 0,
        width: element.boundsInParent?.width || 0,
        height: element.boundsInParent?.height || 0,
        rotation: element.rotation || 0,
        opacity: element.opacity !== undefined ? element.opacity : 1
    };

    // Add type-specific properties
    switch (element.constructor.name) {
        case "RectangleNode":
            baseData.fill = element.fill ? serializeFill(element.fill) : null;
            baseData.stroke = element.stroke ? serializeStroke(element.stroke) : null;
            baseData.cornerRadius = element.cornerRadius || 0;
            break;
            
        case "EllipseNode":
            baseData.fill = element.fill ? serializeFill(element.fill) : null;
            baseData.stroke = element.stroke ? serializeStroke(element.stroke) : null;
            break;
            
        case "TextNode":
            baseData.text = element.text || "";
            baseData.fontSize = element.fontSize || 12;
            baseData.fontFamily = element.fontFamily || "Arial";
            baseData.fill = element.fill ? serializeFill(element.fill) : null;
            break;
            
        case "LineNode":
            baseData.stroke = element.stroke ? serializeStroke(element.stroke) : null;
            baseData.startX = element.startX || 0;
            baseData.startY = element.startY || 0;
            baseData.endX = element.endX || 0;
            baseData.endY = element.endY || 0;
            break;
            
        default:
            // For unknown types, try to capture basic properties
            baseData.genericType = true;
            break;
    }

    return baseData;
}

/**
 * Deserialize element data back to an Express element
 * @param {Object} elementData - The serialized element data
 * @returns {Promise<*>} The recreated element
 */
async function deserializeElement(elementData) {
    let element;

    try {
        switch (elementData.type) {
            case "RectangleNode":
                element = editor.createRectangle();
                if (elementData.fill) {
                    element.fill = deserializeFill(elementData.fill);
                }
                if (elementData.stroke) {
                    element.stroke = deserializeStroke(elementData.stroke);
                }
                if (elementData.cornerRadius) {
                    element.cornerRadius = elementData.cornerRadius;
                }
                break;
                
            case "EllipseNode":
                element = editor.createEllipse();
                if (elementData.fill) {
                    element.fill = deserializeFill(elementData.fill);
                }
                if (elementData.stroke) {
                    element.stroke = deserializeStroke(elementData.stroke);
                }
                break;
                
            case "TextNode":
                element = editor.createText();
                element.text = elementData.text || "";
                if (elementData.fontSize) {
                    element.fontSize = elementData.fontSize;
                }
                if (elementData.fontFamily) {
                    element.fontFamily = elementData.fontFamily;
                }
                if (elementData.fill) {
                    element.fill = deserializeFill(elementData.fill);
                }
                break;
                
            case "LineNode":
                element = editor.createLine();
                if (elementData.stroke) {
                    element.stroke = deserializeStroke(elementData.stroke);
                }
                element.setStartEnd(
                    elementData.startX || 0,
                    elementData.startY || 0,
                    elementData.endX || 0,
                    elementData.endY || 0
                );
                break;
                
            default:
                console.warn(`Unknown element type: ${elementData.type}`);
                return null;
        }

        if (element) {
            // Set common properties
            if (elementData.name) {
                element.name = elementData.name;
            }
            
            // Set transform properties
            element.moveInParent(elementData.x || 0, elementData.y || 0);
            
            if (elementData.rotation) {
                element.rotation = elementData.rotation;
            }
            
            if (elementData.opacity !== undefined) {
                element.opacity = elementData.opacity;
            }
        }

        return element;
    } catch (error) {
        console.error("Error deserializing element:", error);
        return null;
    }
}

/**
 * Serialize fill properties
 * @param {*} fill - The fill object
 * @returns {Object} Serialized fill data
 */
function serializeFill(fill) {
    if (!fill) return null;
    
    return {
        type: fill.constructor.name,
        color: fill.color ? {
            r: fill.color.r,
            g: fill.color.g,
            b: fill.color.b,
            a: fill.color.a
        } : null
    };
}

/**
 * Deserialize fill properties
 * @param {Object} fillData - The serialized fill data
 * @returns {*} The recreated fill object
 */
function deserializeFill(fillData) {
    if (!fillData || !fillData.color) return null;
    
    try {
        const color = editor.makeColor(
            fillData.color.r,
            fillData.color.g,
            fillData.color.b,
            fillData.color.a
        );
        return editor.makeColorFill(color);
    } catch (error) {
        console.error("Error deserializing fill:", error);
        return null;
    }
}

/**
 * Serialize stroke properties
 * @param {*} stroke - The stroke object
 * @returns {Object} Serialized stroke data
 */
function serializeStroke(stroke) {
    if (!stroke) return null;
    
    return {
        color: stroke.color ? {
            r: stroke.color.r,
            g: stroke.color.g,
            b: stroke.color.b,
            a: stroke.color.a
        } : null,
        width: stroke.width || 1
    };
}

/**
 * Deserialize stroke properties
 * @param {Object} strokeData - The serialized stroke data
 * @returns {*} The recreated stroke object
 */
function deserializeStroke(strokeData) {
    if (!strokeData || !strokeData.color) return null;
    
    try {
        const color = editor.makeColor(
            strokeData.color.r,
            strokeData.color.g,
            strokeData.color.b,
            strokeData.color.a
        );
        return editor.makeStroke({
            color: color,
            width: strokeData.width || 1
        });
    } catch (error) {
        console.error("Error deserializing stroke:", error);
        return null;
    }
}

console.log("🎉 Document sandbox loaded and APIs exposed successfully!");
console.log("Available APIs: saveSnapshot, listSnapshots, restoreSnapshot, deleteSnapshot");
console.log("Snapshots array initialized:", snapshots.length);
