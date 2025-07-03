import React, { useState, useEffect } from "react";
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import "./VersionControl.css";

const VersionControl = ({ addOnUISdk }) => {
    const [snapshots, setSnapshots] = useState([]);
    const [newSnapshotName, setNewSnapshotName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sandboxProxy, setSandboxProxy] = useState(null);

    // Store mock snapshots outside the function to persist between calls
    const [mockSnapshots, setMockSnapshots] = useState([]);

    // Initialize sandbox proxy
    useEffect(() => {
        if (addOnUISdk) {
            const proxy = addOnUISdk.app.devFlags?.isDevMode 
                ? addOnUISdk.app.document
                : addOnUISdk.app.document;
            setSandboxProxy(proxy);
        }
    }, [addOnUISdk]);

    // Load snapshots on component mount
    useEffect(() => {
        // Load snapshots after a short delay to ensure everything is initialized
        const timer = setTimeout(() => {
            loadSnapshots();
        }, 100);
        
        return () => clearTimeout(timer);
    }, [addOnUISdk]);

    // Get document sandbox proxy
    const getDocumentSandbox = () => {
        try {
            // Check if the runtime API proxy is available
            if (addOnUISdk?.runtime?.apiProxy) {
                return addOnUISdk.runtime.apiProxy("documentSandbox");
            } else if (addOnUISdk?.app?.runtime?.apiProxy) {
                return addOnUISdk.app.runtime.apiProxy("documentSandbox");
            } else {
                console.warn("Runtime API proxy not available, using mock for development");
                // Return a mock sandbox for development/testing
                return createMockSandbox();
            }
        } catch (error) {
            console.error("Failed to get document sandbox proxy:", error);
            setStatusMessage("Error: Could not connect to document sandbox");
            return null;
        }
    };

    // Create a mock sandbox for development/testing
    const createMockSandbox = () => {
        return {
            saveSnapshot: async (name) => {
                const snapshot = {
                    id: Date.now().toString(),
                    name: name,
                    timestamp: new Date().toISOString()
                };
                setMockSnapshots(prev => {
                    const updated = [...prev, snapshot];
                    console.log("Mock: Snapshot saved", snapshot);
                    console.log("Mock: Total snapshots now:", updated.length);
                    return updated;
                });
                return {
                    success: true,
                    snapshot: snapshot
                };
            },
            
            listSnapshots: async () => {
                // Use a callback to get the current state value
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        console.log("Mock: Listing snapshots", current);
                        resolve({
                            success: true,
                            snapshots: current
                        });
                        return current; // Don't change the state
                    });
                });
            },
            
            restoreSnapshot: async (index) => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        if (index >= 0 && index < current.length) {
                            console.log("Mock: Restoring snapshot", current[index]);
                            resolve({
                                success: true,
                                message: `Mock restored: ${current[index].name}`
                            });
                        } else {
                            resolve({
                                success: false,
                                error: "Invalid snapshot index"
                            });
                        }
                        return current; // Don't change the state
                    });
                });
            },
            
            deleteSnapshot: async (index) => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        if (index >= 0 && index < current.length) {
                            const deleted = current[index];
                            const updated = current.filter((_, i) => i !== index);
                            console.log("Mock: Deleted snapshot", deleted);
                            resolve({
                                success: true,
                                message: `Mock deleted: ${deleted.name}`
                            });
                            return updated;
                        } else {
                            resolve({
                                success: false,
                                error: "Invalid snapshot index"
                            });
                            return current;
                        }
                    });
                });
            }
        };
    };

    // Load all snapshots
    const loadSnapshots = async () => {
        try {
            setIsLoading(true);
            const sandbox = getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.listSnapshots();
            if (result.success) {
                setSnapshots(result.snapshots || []);
                setStatusMessage("Snapshots loaded successfully");
            } else {
                setStatusMessage(`Error loading snapshots: ${result.error}`);
            }
        } catch (error) {
            console.error("Error loading snapshots:", error);
            setStatusMessage(`Error loading snapshots: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Capture a new snapshot
    const captureSnapshot = async () => {
        console.log("Capture snapshot called with name:", newSnapshotName);
        
        if (!newSnapshotName.trim()) {
            setStatusMessage("Please enter a name for the snapshot");
            return;
        }

        try {
            setIsLoading(true);
            setStatusMessage("Capturing snapshot...");
            
            const sandbox = getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.saveSnapshot(newSnapshotName.trim());
            if (result.success) {
                setStatusMessage(`Snapshot "${result.snapshot.name}" captured successfully`);
                setNewSnapshotName("");
                await loadSnapshots(); // Refresh the list
            } else {
                setStatusMessage(`Error capturing snapshot: ${result.error}`);
            }
        } catch (error) {
            console.error("Error capturing snapshot:", error);
            setStatusMessage(`Error capturing snapshot: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Restore a snapshot
    const restoreSnapshot = async (index) => {
        try {
            setIsLoading(true);
            setStatusMessage(`Restoring snapshot "${snapshots[index].name}"...`);
            
            const sandbox = getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.restoreSnapshot(index);
            if (result.success) {
                setStatusMessage(result.message);
            } else {
                setStatusMessage(`Error restoring snapshot: ${result.error}`);
            }
        } catch (error) {
            console.error("Error restoring snapshot:", error);
            setStatusMessage(`Error restoring snapshot: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a snapshot
    const deleteSnapshot = async (index) => {
        if (!window.confirm(`Are you sure you want to delete "${snapshots[index].name}"?`)) {
            return;
        }

        try {
            setIsLoading(true);
            setStatusMessage(`Deleting snapshot "${snapshots[index].name}"...`);
            
            const sandbox = getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.deleteSnapshot(index);
            if (result.success) {
                setStatusMessage(result.message);
                await loadSnapshots(); // Refresh the list
            } else {
                setStatusMessage(`Error deleting snapshot: ${result.error}`);
            }
        } catch (error) {
            console.error("Error deleting snapshot:", error);
            setStatusMessage(`Error deleting snapshot: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (error) {
            return timestamp;
        }
    };

    // Handle Enter key in text field
    const handleKeyPress = (event) => {
        if (event.key === "Enter" && !isLoading && newSnapshotName.trim()) {
            event.preventDefault();
            captureSnapshot();
        }
    };

    return (
        <Theme system="express" scale="medium" color="light">
            <div className="version-control-container">
                <header className="version-control-header">
                    <h2>Design Version Control</h2>
                    <p>Capture, manage, and restore design snapshots</p>
                    {/* Mock mode indicator */}
                    {!addOnUISdk?.app?.runtime?.apiProxy && (
                        <div className="mock-mode-indicator">
                            🧪 <strong>Mock Mode</strong> - Load in Adobe Express for real functionality
                        </div>
                    )}
                </header>

                {/* Capture New Snapshot Section */}
                <section className="capture-section">
                    <h3>Capture New Snapshot</h3>
                    <div className="capture-controls">
                        <input
                            type="text"
                            className="snapshot-input"
                            value={newSnapshotName}
                            onChange={(event) => setNewSnapshotName(event.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Enter snapshot name..."
                            disabled={isLoading}
                        />
                        <Button
                            variant="accent"
                            onClick={captureSnapshot}
                            disabled={isLoading || !newSnapshotName.trim()}
                        >
                            {isLoading ? "Capturing..." : "Capture Snapshot"}
                        </Button>
                    </div>
                </section>

                {/* Status Message */}
                {statusMessage && (
                    <div className={`status-message ${statusMessage.includes("Error") ? "error" : "success"}`}>
                        {statusMessage}
                    </div>
                )}

                {/* Snapshots List Section */}
                <section className="snapshots-section">
                    <div className="snapshots-header">
                        <h3>Saved Snapshots ({snapshots.length})</h3>
                        <Button
                            variant="secondary"
                            onClick={loadSnapshots}
                            disabled={isLoading}
                            size="s"
                        >
                            Refresh
                        </Button>
                    </div>

                    {isLoading && (
                        <div className="loading-indicator">
                            Loading...
                        </div>
                    )}

                    {snapshots.length === 0 && !isLoading ? (
                        <div className="empty-state">
                            <p>No snapshots yet</p>
                            <p>Capture your first design snapshot above!</p>
                        </div>
                    ) : (
                        <div className="snapshots-list">
                            {snapshots.map((snapshot, index) => (
                                <div key={snapshot.id} className="snapshot-item">
                                    <div className="snapshot-info">
                                        <div className="snapshot-name">{snapshot.name}</div>
                                        <div className="snapshot-timestamp">
                                            {formatTimestamp(snapshot.timestamp)}
                                        </div>
                                    </div>
                                    <div className="snapshot-actions">
                                        <Button
                                            variant="primary"
                                            size="s"
                                            onClick={() => restoreSnapshot(index)}
                                            disabled={isLoading}
                                        >
                                            Restore
                                        </Button>
                                        <Button
                                            variant="negative"
                                            size="s"
                                            onClick={() => deleteSnapshot(index)}
                                            disabled={isLoading}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Help Section */}
                <section className="help-section">
                    <details>
                        <summary>How to use Version Control</summary>
                        <div className="help-content">
                            <ol>
                                <li><strong>Capture Snapshot:</strong> Enter a descriptive name and click "Capture Snapshot" to save the current design state</li>
                                <li><strong>Restore:</strong> Click "Restore" next to any snapshot to revert your design to that saved state</li>
                                <li><strong>Delete:</strong> Click "Delete" to permanently remove a snapshot (confirmation required)</li>
                                <li><strong>Refresh:</strong> Click "Refresh" to reload the snapshots list</li>
                            </ol>
                            <p><strong>Note:</strong> Snapshots are stored temporarily and will be lost when you close the add-on.</p>
                        </div>
                    </details>
                </section>
            </div>
        </Theme>
    );
};

export default VersionControl;
