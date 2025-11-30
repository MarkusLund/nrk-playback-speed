# Video Playback Speed Controller

A Chrome extension that allows you to control playback speed on **YouTube** and **NRK TV**.

**Norwegian**: En Chrome-utvidelse som lar deg kontrollere avspillingshastigheten på YouTube og NRK TV.

## Features

- 🎬 Control video playback speed on YouTube and NRK TV
- ⚡ Speed options from 1× to 3× (including 2.5× and 3× for faster viewing)
- 🎯 On-player speed indicator button that cycles through speeds on click
- 💾 Remembers your speed preference across sessions
- 🔄 Works with dynamically loaded videos (SPA navigation)

## Supported Sites

| Site                                   | Status          |
| -------------------------------------- | --------------- |
| [youtube.com](https://www.youtube.com) | ✅ Full support |
| [tv.nrk.no](https://tv.nrk.no)         | ✅ Full support |

## Installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Run `npm install && npm run build` to compile TypeScript
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the extension directory

## Usage

### On YouTube

1. Navigate to any YouTube video
2. Start playing the video
3. Look for the speed indicator (e.g., "1×") in the player controls (left of settings button)
4. **Click the indicator** to cycle through speeds: 1× → 1.25× → 1.5× → 1.75× → 2× → 2.5× → 3×
5. Or use the **extension popup** in Chrome toolbar to select a speed

### On NRK TV

1. Navigate to [tv.nrk.no](https://tv.nrk.no) or any NRK video page
2. Start playing a video
3. Look for the speed indicator in the player controls
4. Click to cycle speeds, or use the extension popup

## Why This Extension?

YouTube has placed playback speed controls behind a paywall (YouTube Premium). This extension uses the browser's native `HTMLVideoElement.playbackRate` API, which **cannot be restricted** by any website. It's a standard web API that works on any HTML5 video.

## Development

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Watch for changes during development
npm run watch

# Bump version and build
npm run bump
```

### Project Structure

```
nrkPlaybackSpeed/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup interface
├── popup.ts               # Popup logic (TypeScript)
├── speed.ts               # Content script for NRK
├── speed-youtube.ts       # Content script for YouTube
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
└── bump-version.js        # Version management script
```

### Files Description

- **`manifest.json`**: Chrome extension configuration and metadata
- **`popup.html`**: The HTML for the extension's popup interface
- **`popup.ts`**: TypeScript code for the popup functionality
- **`speed.ts`**: Content script that runs on NRK pages
- **`speed-youtube.ts`**: Content script that runs on YouTube pages
- **`bump-version.js`**: Utility script for version management

### Permissions

The extension requires the following permissions:

- **`scripting`**: To inject content scripts
- **`activeTab`**: To interact with the currently active tab
- **`storage`**: To save user preferences
- **Host permissions**: Access to `*.nrk.no` and `*.youtube.com` domains

## How It Works

The extension injects a content script that:

1. Finds all `<video>` elements on the page
2. Sets the `playbackRate` property to your desired speed
3. Adds a visual speed indicator to the player controls
4. Persists your preference using Chrome's sync storage

This works because `playbackRate` is a standard HTML5 Video API that browsers expose regardless of what the website wants to allow.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both YouTube and NRK
5. Submit a pull request

## License

This project is open source. Please check the license file for details.

## Support

If you encounter any issues:

1. Check that you're on a supported page (YouTube or NRK)
2. Refresh the page and try again
3. Make sure the video player has fully loaded
4. Report issues through the repository's issue tracker

---

**Note**: This extension is unofficial and not affiliated with YouTube, Google, or NRK (Norwegian Broadcasting Corporation).
