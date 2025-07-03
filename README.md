# Design Version Control - Adobe Express Add-on

A fully functional Adobe Express add-on that implements a design "Version Control" panel, allowing users to capture, list, restore, and delete design snapshots using the Document Sandbox API.

## Features

- **Capture Snapshots**: Save the current design state with a custom name
- **List Snapshots**: View all saved snapshots with timestamps
- **Restore Snapshots**: Revert to any previously saved design state
- **Delete Snapshots**: Remove unwanted snapshots with confirmation
- **Real-time Status**: Get feedback on all operations
- **Modern UI**: Clean, responsive interface using Spectrum Web Components

## Architecture

### UI Layer (`src/components/VersionControl.jsx`)
- React component with state management
- Uses Spectrum Web Components for consistent Adobe Express styling
- Communicates with document sandbox via `runtime.apiProxy("documentSandbox")`

### Document Sandbox (`src/sandbox/document.js`)
- Implements snapshot capture using Express Document SDK
- Serializes/deserializes document elements (rectangles, text, ellipses, lines)
- Exposes APIs: `saveSnapshot`, `listSnapshots`, `restoreSnapshot`, `deleteSnapshot`
- Handles element properties: position, size, fills, strokes, text formatting

### Build System
- Webpack-based build with Babel transpilation
- Copies sandbox files to distribution
- Development and production configurations

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

## Development

### Start Development Server
```bash
npm start
```
This will:
- Build the add-on in development mode
- Start the development server
- Open Adobe Express with your add-on loaded
- Enable hot reloading for code changes

### Build for Production
```bash
npm run build
```
Creates optimized production build in the `dist` folder.

### Package for Distribution
```bash
npm run package
```
Creates a packaged add-on ready for submission.

### Clean Build Files
```bash
npm run clean
```
Removes all build artifacts.

## Usage

1. **Open Adobe Express** and create or open a design
2. **Load the Add-on** from the panel (it will appear as "Design Version Control")
3. **Create Design Elements** - add shapes, text, or other elements to your design
4. **Capture Snapshot**:
   - Enter a descriptive name in the text field
   - Click "Capture Snapshot" or press Enter
   - You'll see a success message
5. **View Snapshots**: All saved snapshots appear in the list with timestamps
6. **Restore**: Click "Restore" next to any snapshot to revert your design
7. **Delete**: Click "Delete" to remove a snapshot (requires confirmation)

## API Reference

### Document Sandbox APIs

#### `saveSnapshot(name: string)`
```javascript
const result = await sandbox.saveSnapshot("My Design V1");
// Returns: { success: boolean, snapshot: { id, name, timestamp } }
```

#### `listSnapshots()`
```javascript
const result = await sandbox.listSnapshots();
// Returns: { success: boolean, snapshots: Array<{ id, name, timestamp }> }
```

#### `restoreSnapshot(index: number)`
```javascript
const result = await sandbox.restoreSnapshot(0);
// Returns: { success: boolean, message: string }
```

#### `deleteSnapshot(index: number)`
```javascript
const result = await sandbox.deleteSnapshot(0);
// Returns: { success: boolean, message: string }
```

## Supported Elements

The add-on can capture and restore:
- **Rectangles**: Position, size, fill, stroke, corner radius
- **Ellipses**: Position, size, fill, stroke
- **Text**: Content, position, font size, font family, fill
- **Lines**: Start/end points, stroke properties
- **Basic Properties**: Rotation, opacity for all elements

## Development Tips

### Debugging
1. **Check Browser Console**: All errors and logs appear in the browser console
2. **Mock Mode**: If sandbox APIs aren't available, the add-on uses mock data for testing
3. **Status Messages**: Watch the status area for operation feedback

### Testing Workflow
1. Create some design elements
2. Capture a snapshot
3. Modify the design
4. Restore the snapshot to verify it works
5. Test delete functionality

### Common Issues
- **"Cannot read properties of undefined"**: The sandbox proxy isn't available - the add-on will fall back to mock mode
- **Elements not restoring**: Some complex elements may not be fully supported yet
- **Snapshots lost**: Snapshots are stored in memory and reset when the add-on reloads

## File Structure
```
src/
├── components/
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── VersionControl.jsx      # Main version control component
│   └── VersionControl.css      # Version control styles
├── sandbox/
│   └── document.js            # Document sandbox implementation
├── index.jsx                  # Entry point
├── index.html                 # HTML template
└── manifest.json             # Add-on manifest
```

## Contributing

1. Make changes to the source files
2. Test with `npm start`
3. Build with `npm run build`
4. Verify the packaged add-on works

## License

This project is licensed under the MIT License.
```bash
npm start
```
This will:
- Start the webpack dev server
- Enable hot reloading for React components
- Launch the add-on in Adobe Express for testing
- Watch for file changes and rebuild automatically

### Build for Production
```bash
npm run build
```
This creates a `dist/` folder with:
- Optimized JavaScript bundles
- Minified CSS
- Copied manifest and sandbox files
- Source maps for debugging

### Package for Distribution
```bash
npm run package
```
Creates a `.ccx` package file ready for distribution or submission to Adobe.

### Clean Build Files
```bash
npm run clean
```
Removes all build artifacts and temporary files.

## Testing & Debugging

### Testing in Adobe Express
1. Run `npm start`
2. The add-on will automatically load in Adobe Express
3. Open the Developer Tools in your browser
4. Look for console logs from both UI and sandbox contexts

### Debugging Tips

#### UI Debugging
- Open browser Developer Tools while the add-on is running
- Check the Console tab for React component logs
- Use React Developer Tools extension for component inspection
- Monitor Network tab for API communication

#### Sandbox Debugging
- Sandbox logs appear in the main browser console
- Look for "Document sandbox loaded and APIs exposed" message
- Check for serialization/deserialization errors
- Monitor Express Document SDK API calls

#### Common Issues

1. **"Could not connect to document sandbox"**
   - Ensure manifest.json includes the sandbox configuration
   - Check that sandbox/document.js is being copied to dist/
   - Verify the sandbox ID matches between manifest and API calls

2. **Snapshot capture fails**
   - Check browser console for Express Document SDK errors
   - Ensure there's content on the artboard to capture
   - Verify document context is available

3. **Restore operation fails**
   - Check that the snapshot data is valid
   - Look for element deserialization errors
   - Ensure document has permission to modify content

## API Reference

### Document Sandbox APIs

#### `saveSnapshot(name: string)`
Captures the current document state and saves it with the given name.

**Parameters:**
- `name`: String - Name for the snapshot

**Returns:**
```javascript
{
    success: boolean,
    snapshot?: {
        id: string,
        name: string,
        timestamp: string
    },
    error?: string
}
```

#### `listSnapshots()`
Returns all saved snapshots.

**Returns:**
```javascript
{
    success: boolean,
    snapshots: Array<{
        id: string,
        name: string,
        timestamp: string
    }>,
    error?: string
}
```

#### `restoreSnapshot(index: number)`
Restores a snapshot by its index in the snapshots array.

**Parameters:**
- `index`: Number - Index of the snapshot to restore

**Returns:**
```javascript
{
    success: boolean,
    message?: string,
    error?: string
}
```

#### `deleteSnapshot(index: number)`
Deletes a snapshot by its index.

**Parameters:**
- `index`: Number - Index of the snapshot to delete

**Returns:**
```javascript
{
    success: boolean,
    message?: string,
    error?: string
}
```

## Supported Elements

The add-on can capture and restore the following Adobe Express elements:

- **Rectangles**: Position, size, fill, stroke, corner radius
- **Ellipses**: Position, size, fill, stroke
- **Text**: Content, position, size, font family, font size, fill
- **Lines**: Start/end points, stroke properties
- **Basic Shapes**: Generic elements with position and basic properties

## File Structure

```
src/
├── components/
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── VersionControl.jsx      # Main version control component
│   └── VersionControl.css      # Version control styles
├── sandbox/
│   └── document.js             # Document sandbox implementation
├── index.jsx                   # Entry point
├── index.html                  # HTML template
└── manifest.json               # Add-on manifest

dist/                           # Built files (generated)
├── sandbox/
│   └── document.js
├── index.js
├── index.html
└── manifest.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Adobe Express
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Build Issues
- Ensure Node.js version 16+ is installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all dependencies are correctly listed in package.json

### Runtime Issues
- Check Adobe Express console for error messages
- Verify manifest.json syntax is valid
- Ensure sandbox files are properly included in the build

### Performance Issues
- Large documents may take longer to serialize
- Consider implementing pagination for large snapshot lists
- Monitor memory usage with many saved snapshots

For additional support, check the Adobe Express Add-on documentation or file an issue in the repository.

## Development

### Start Development Server
```bash
npm start
```
This will:
- Build the add-on in development mode
- Start the development server
- Watch for file changes and rebuild automatically
- Make the add-on available for testing in Adobe Express

### Testing in Adobe Express
1. Run `npm start`
2. Open Adobe Express in your browser
3. Go to Add-ons panel
4. Load your development add-on
5. The Version Control panel will appear in the sidebar

### Key Development Notes
- **Hot Reload**: Changes to React components will update automatically
- **Sandbox Changes**: Modifications to `document.js` require a full restart
- **Debugging**: Use browser DevTools for UI debugging, sandbox logs appear in Express console

## Production Build

### Create Production Package
```bash
npm run build
```
This creates optimized files in the `dist/` directory.

### Package for Distribution
```bash
npm run package
```
This creates a ZIP file ready for Adobe Express Add-on marketplace submission.

## API Reference

### Document Sandbox APIs

#### `saveSnapshot(name: string)`
Captures the current document state and saves it with the given name.
```javascript
const result = await sandbox.saveSnapshot("My Design v1");
// Returns: { success: boolean, snapshot?: { id, name, timestamp }, error?: string }
```

#### `listSnapshots()`
Returns an array of all saved snapshots.
```javascript
const result = await sandbox.listSnapshots();
// Returns: { success: boolean, snapshots: Array<{ id, name, timestamp }>, error?: string }
```

#### `restoreSnapshot(index: number)`
Restores the snapshot at the given index.
```javascript
const result = await sandbox.restoreSnapshot(0);
// Returns: { success: boolean, message?: string, error?: string }
```

#### `deleteSnapshot(index: number)`
Deletes the snapshot at the given index.
```javascript
const result = await sandbox.deleteSnapshot(0);
// Returns: { success: boolean, message?: string, error?: string }
```

## Supported Element Types

The version control system can capture and restore:
- **Rectangles**: Position, size, fill, stroke, corner radius
- **Ellipses**: Position, size, fill, stroke
- **Text**: Content, position, size, font family, font size, fill
- **Lines**: Start/end points, stroke properties
- **Transform Properties**: Rotation, opacity for all elements

## Troubleshooting

### Common Issues

1. **Sandbox not connecting**
   - Ensure `manifest.json` includes sandbox configuration
   - Check browser console for error messages
   - Verify sandbox files are copied to `dist/sandbox/`

2. **Elements not restoring properly**
   - Some complex elements may not serialize completely
   - Check console for serialization warnings
   - Gradients and complex fills may require additional implementation

3. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear `dist/` directory and rebuild
   - Check for syntax errors in JSX files
