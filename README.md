# NRK Playback Speed / Avspillingshastighet

A Chrome extension that allows you to control playback speed on NRK TV Player.

**Norwegian**: En Chrome-utvidelse som lar deg kontrollere avspillingshastigheten på NRK TV-spiller.

![NRK Player with speed control](image.png)

## Installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to [tv.nrk.no](https://tv.nrk.no) or any NRK video page
2. Start playing a video
3. Click the extension icon in your Chrome toolbar
4. Select your desired playback speed from the popup

## Development

```bash
# Install dependencies
npm install

# Build the extension
npm run build
```

### Project Structure

```
nrkPlaybackSpeed/
├── manifest.json          # Extension manifest
├── popup.html            # Extension popup interface
├── popup.ts              # Popup logic (TypeScript)
├── speed.ts              # Content script for speed control
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
└── bump-version.js       # Version management script
```

### Files Description

- **`manifest.json`**: Chrome extension configuration and metadata
- **`popup.html`**: The HTML for the extension's popup interface
- **`popup.ts`**: TypeScript code for the popup functionality
- **`speed.ts`**: Content script that runs on NRK pages to control playback speed
- **`bump-version.js`**: Utility script for version management

### Permissions

The extension requires the following permissions:

- **`scripting`**: To inject content scripts into NRK pages
- **`activeTab`**: To interact with the currently active tab
- **`storage`**: To save user preferences
- **Host permissions**: Access to `*.nrk.no` domains to interact with NRK's video player

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on NRK TV Player
5. Submit a pull request

## License

This project is open source. Please check the license file for details.

## Support

If you encounter any issues:

1. Check that you're on a supported NRK page
2. Refresh the page and try again
3. Report issues through the repository's issue tracker

---

**Note**: This extension is unofficial and not affiliated with NRK (Norwegian Broadcasting Corporation).
