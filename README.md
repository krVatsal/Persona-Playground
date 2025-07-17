# Design Version Control - Adobe Express Add-on

A version control system for Adobe Express that lets you save, restore, and manage design snapshots.

## What it does

- Save design snapshots with custom names
- View all saved versions with thumbnails
- Restore any previous version instantly
- Delete unwanted snapshots
- Download snapshots as JSON files

## Getting started

```bash
npm install
npm start
```

This opens Adobe Express with your add-on loaded for testing.

## How to use

1. Create some design elements in Adobe Express
2. Enter a name and click "Capture Snapshot"
3. Make changes to your design
4. Click "Restore" on any snapshot to go back
5. Use "Delete" to remove snapshots you don't need

## Building

```bash
npm run build    # Creates production build
npm run package  # Creates .ccx file for distribution
npm run clean    # Removes build files
```

## File structure

```
src/
├── components/
│   ├── VersionControl.jsx     # Main UI component
│   └── VersionControl.css     # Styles
├── sandbox/
│   └── document.js           # Document manipulation
├── index.jsx                 # Entry point
└── manifest.json            # Add-on config
```

## Tech stack

- React 18.2.0
- Adobe Express Add-on SDK
- Adobe Spectrum Web Components
- Webpack

## How it works

The add-on uses Adobe's Document Sandbox API to capture and restore design elements. It serializes rectangles, text, ellipses, and lines with their properties like position, size, colors, and fonts.

## Debugging

- Browser console shows UI errors
- Adobe Express console shows sandbox errors
- If the sandbox doesn't connect, it falls back to mock mode for testing

## Notes

- Snapshots are stored in memory (lost on refresh)
- Complex elements might not restore perfectly
- Works best with basic shapes and text
