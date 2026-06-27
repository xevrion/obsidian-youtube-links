# YouTube Link Enhanced

Paste a YouTube link in Obsidian and it automatically becomes a readable link like `Channel: Video Title`, the same way Notion handles it.

No API key needed. Uses YouTube's public oEmbed endpoint.

## How it works

Paste any YouTube URL into a note. The plugin replaces it with a markdown link where the display text shows the channel name and video title.

```
Before: https://www.youtube.com/watch?v=dQw4w9WgXcQ
After:  [Rick Astley: Never Gonna Give You Up](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
```

## Settings

- **Show loading text** - shows `Loading...` as a placeholder while the video info is being fetched
- **Link format** - choose between `Channel: Video Title` or just the video title

## Installation

### From Obsidian Community Plugins

Search for "YouTube Link Enhanced" in Settings > Community plugins.

### Manual

1. Download `main.js` and `manifest.json` from the latest release
2. Create a folder `.obsidian/plugins/youtube-link-enhanced/` in your vault
3. Copy both files into that folder
4. Enable the plugin in Settings > Community plugins

## Development

```bash
git clone https://github.com/xevrion/youtube-link-enhanced
cd youtube-link-enhanced
bun install
bun run dev
```

Copy (or symlink) the folder into your vault's `.obsidian/plugins/` directory, then enable it.
