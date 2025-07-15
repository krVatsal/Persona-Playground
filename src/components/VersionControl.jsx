import React, { useState, useEffect } from "react";
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import "./VersionControl.css";

const VersionControl = ({ addOnUISdk }) => {
    const [snapshots, setSnapshots] = useState([]);
    const [newSnapshotName, setNewSnapshotName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const [mockSnapshots, setMockSnapshots] = useState([]);

    const getDocumentSandbox = async () => {
        if (addOnUISdk?.app?.document) {
            const documentAPI = addOnUISdk.app.document;
            if (documentAPI.createRenditions || documentAPI.addImage || documentAPI.id) {
                setStatusMessage("Connected successfully");
                return createDocumentAPIWrapper(documentAPI);
            }
        }
        setStatusMessage("Ready to capture snapshots");
        return createMockSandbox();
    };

    const createDocumentAPIWrapper = (documentAPI) => {
        return {
            saveSnapshot: async (name) => {
                let thumbnail = null;
                if (documentAPI.createRenditions) {
                    try {
                        const response = await documentAPI.createRenditions({
                            range: "currentPage",
                            format: "image/jpeg",
                        });
                        if (response && response[0]) {
                            thumbnail = URL.createObjectURL(response[0].blob);
                        }
                    } catch {}
                }
                let documentInfo = {};
                try {
                    if (documentAPI.id) documentInfo.documentId = documentAPI.id;
                    if (documentAPI.title) documentInfo.title = documentAPI.title;
                    if (documentAPI.getPagesMetadata) {
                        const pages = await documentAPI.getPagesMetadata();
                        documentInfo.pageCount = pages?.length || 1;
                    }
                } catch {}
                const snapshot = {
                    id: Date.now().toString(),
                    name: name,
                    timestamp: new Date().toISOString(),
                    thumbnail: thumbnail,
                    documentInfo: documentInfo,
                    type: 'snapshot'
                };
                setMockSnapshots(prev => [...prev, snapshot]);
                return { success: true, snapshot };
            },
            listSnapshots: async () => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        resolve({ success: true, snapshots: current });
                        return current;
                    });
                });
            },
            restoreSnapshot: async (index) => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        if (index >= 0 && index < current.length) {
                            const snapshot = current[index];
                            let details = `Name: "${snapshot.name}"`;
                            if (snapshot.documentInfo?.pageCount) {
                                details += ` | Pages: ${snapshot.documentInfo.pageCount}`;
                            }
                            if (snapshot.documentInfo?.documentId) {
                                details += ` | Document: ${snapshot.documentInfo.documentId}`;
                            }
                            resolve({
                                success: true,
                                message: `Snapshot info loaded - ${details}.`
                            });
                        } else {
                            resolve({ success: false, error: "Invalid snapshot index" });
                        }
                        return current;
                    });
                });
            },
            downloadSnapshot: async (index) => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        if (index >= 0 && index < current.length) {
                            const snapshot = current[index];
                            const downloadData = {
                                name: snapshot.name,
                                timestamp: snapshot.timestamp,
                                documentInfo: snapshot.documentInfo,
                                thumbnail: snapshot.thumbnail,
                                type: 'snapshot-export',
                                exportedAt: new Date().toISOString()
                            };
                            const dataStr = JSON.stringify(downloadData, null, 2);
                            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                            const exportFileDefaultName = `snapshot_${snapshot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
                            const linkElement = document.createElement('a');
                            linkElement.setAttribute('href', dataUri);
                            linkElement.setAttribute('download', exportFileDefaultName);
                            document.body.appendChild(linkElement);
                            linkElement.click();
                            document.body.removeChild(linkElement);
                            resolve({ success: true, message: `Downloaded "${snapshot.name}" as ${exportFileDefaultName}` });
                        } else {
                            resolve({ success: false, error: "Invalid snapshot index" });
                        }
                        return current;
                    });
                });
            },
            deleteSnapshot: async (index) => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        if (index >= 0 && index < current.length) {
                            const deleted = current[index];
                            const updated = current.filter((_, i) => i !== index);
                            resolve({ success: true, message: `Deleted: ${deleted.name}` });
                            return updated;
                        } else {
                            resolve({ success: false, error: "Invalid snapshot index" });
                            return current;
                        }
                    });
                });
            }
        };
    };

// Duplicate createMockSandbox removed
// (removed duplicate/broken code)

    // Create a mock sandbox for development/testing
    const createMockSandbox = () => {
        return {
            saveSnapshot: async (name) => {
                try {
                    let thumbnail = null;
                    if (addOnUISdk?.app?.document?.createRenditions) {
                        try {
                            const response = await addOnUISdk.app.document.createRenditions({
                                range: "currentPage",
                                format: "image/jpeg",
                            });
                            if (response && response[0]) {
                                thumbnail = URL.createObjectURL(response[0].blob);
                            }
                        } catch (thumbError) {
                            // Silently handle thumbnail errors
                        }
                    }

                    const snapshot = {
                        id: Date.now().toString(),
                        name: name,
                        timestamp: new Date().toISOString(),
                        thumbnail: thumbnail
                    };
                    setMockSnapshots(prev => [...prev, snapshot]);
                    return {
                        success: true,
                        snapshot: snapshot
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            },
            
            listSnapshots: async () => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        resolve({
                            success: true,
                            snapshots: current
                        });
                        return current;
                    });
                });
            },
            
            restoreSnapshot: async (index) => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        if (index >= 0 && index < current.length) {
                            resolve({
                                success: true,
                                message: `Restored: ${current[index].name}`
                            });
                        } else {
                            resolve({
                                success: false,
                                error: "Invalid snapshot index"
                            });
                        }
                        return current;
                    });
                });
            },
            
            downloadSnapshot: async (index) => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        if (index >= 0 && index < current.length) {
                            const snapshot = current[index];
                            
                            const downloadData = {
                                name: snapshot.name,
                                timestamp: snapshot.timestamp,
                                thumbnail: snapshot.thumbnail,
                                type: 'snapshot-export',
                                exportedAt: new Date().toISOString()
                            };
                            
                            const dataStr = JSON.stringify(downloadData, null, 2);
                            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                            const exportFileDefaultName = `snapshot_${snapshot.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
                            
                            const linkElement = document.createElement('a');
                            linkElement.setAttribute('href', dataUri);
                            linkElement.setAttribute('download', exportFileDefaultName);
                            linkElement.click();
                            
                            resolve({
                                success: true,
                                message: `Downloaded "${snapshot.name}" as ${exportFileDefaultName}`
                            });
                        } else {
                            resolve({
                                success: false,
                                error: "Invalid snapshot index"
                            });
                        }
                        return current;
                    });
                });
            },
            
            deleteSnapshot: async (index) => {
                return new Promise((resolve) => {
                    setMockSnapshots(current => {
                        if (index >= 0 && index < current.length) {
                            const deleted = current[index];
                            const updated = current.filter((_, i) => i !== index);
                            resolve({
                                success: true,
                                message: `Deleted: ${deleted.name}`
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
            const sandbox = await getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.listSnapshots();
            if (result.success) {
                setSnapshots(result.snapshots || []);
                setStatusMessage("Snapshots loaded successfully");
            } else {
                setStatusMessage(`Error loading snapshots: ${result.error}`);
            }
        } catch (error) {
            setStatusMessage(`Error loading snapshots: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Capture a new snapshot
    const captureSnapshot = async () => {
        if (!newSnapshotName.trim()) {
            setStatusMessage("Please enter a name for the snapshot");
            return;
        }

        try {
            setIsLoading(true);
            setStatusMessage("Capturing snapshot...");
            
            const sandbox = await getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.saveSnapshot(newSnapshotName.trim());
            if (result.success) {
                setStatusMessage(`Snapshot "${result.snapshot.name}" captured successfully`);
                setNewSnapshotName("");
                await loadSnapshots();
            } else {
                setStatusMessage(`Error capturing snapshot: ${result.error}`);
            }
        } catch (error) {
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
            
            const sandbox = await getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.restoreSnapshot(index);
            if (result.success) {
                setStatusMessage(result.message);
            } else {
                setStatusMessage(`Error restoring snapshot: ${result.error}`);
            }
        } catch (error) {
            setStatusMessage(`Error restoring snapshot: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a snapshot
    const deleteSnapshot = async (index) => {
        setConfirmingDelete(index);
    };

    // Download a snapshot
    const downloadSnapshot = async (index) => {
        try {
            setIsLoading(true);
            setStatusMessage(`Downloading snapshot "${snapshots[index].name}"...`);
            
            const sandbox = await getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.downloadSnapshot(index);
            if (result.success) {
                setStatusMessage(result.message);
            } else {
                setStatusMessage(`Error downloading snapshot: ${result.error}`);
            }
        } catch (error) {
            setStatusMessage(`Error downloading snapshot: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Confirm delete action
    const confirmDelete = async () => {
        const index = confirmingDelete;
        setConfirmingDelete(null);

        try {
            setIsLoading(true);
            setStatusMessage(`Deleting snapshot "${snapshots[index].name}"...`);
            
            const sandbox = await getDocumentSandbox();
            if (!sandbox) return;

            const result = await sandbox.deleteSnapshot(index);
            if (result.success) {
                setStatusMessage(result.message);
                await loadSnapshots();
            } else {
                setStatusMessage(`Error deleting snapshot: ${result.error}`);
            }
        } catch (error) {
            setStatusMessage(`Error deleting snapshot: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel delete action
    const cancelDelete = () => {
        setConfirmingDelete(null);
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

                {/* Confirmation Message */}
                {confirmingDelete !== null && (
                    <div className="status-message warning">
                        ⚠️ Click "Confirm" to permanently delete "{snapshots[confirmingDelete]?.name}" or "Cancel" to abort.
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
                                    {snapshot.thumbnail && (
                                        <div className="snapshot-thumbnail">
                                            <img src={snapshot.thumbnail} alt={`Snapshot: ${snapshot.name}`} />
                                        </div>
                                    )}
                                    <div className="snapshot-info">
                                        <div className="snapshot-name">
                                            {snapshot.name}
                                        </div>
                                        <div className="snapshot-timestamp">
                                            {formatTimestamp(snapshot.timestamp)}
                                            {snapshot.documentInfo?.pageCount && (
                                                <span className="page-info"> • {snapshot.documentInfo.pageCount} page{snapshot.documentInfo.pageCount !== 1 ? 's' : ''}</span>
                                            )}
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
                                            variant="secondary"
                                            size="s"
                                            onClick={() => downloadSnapshot(index)}
                                            disabled={isLoading}
                                        >
                                            Download
                                        </Button>
                                        {confirmingDelete === index ? (
                                            <>
                                                <Button
                                                    variant="negative"
                                                    size="s"
                                                    onClick={confirmDelete}
                                                    disabled={isLoading}
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="s"
                                                    onClick={cancelDelete}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="negative"
                                                size="s"
                                                onClick={() => deleteSnapshot(index)}
                                                disabled={isLoading}
                                            >
                                                Delete
                                            </Button>
                                        )}
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
