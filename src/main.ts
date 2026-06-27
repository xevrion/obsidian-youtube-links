import { Editor, MarkdownFileInfo, MarkdownView, Plugin, requestUrl } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings, SettingsTab } from './settings';

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s]*)?/;

interface OEmbedResponse {
	title: string;
	author_name: string;
}

function extractYouTubeUrl(text: string): string | null {
	const match = text.match(YOUTUBE_REGEX);
	return match ? match[0] : null;
}

function normalizeUrl(url: string): string {
	if (!url.startsWith('http')) return 'https://' + url;
	return url;
}

async function fetchVideoInfo(url: string): Promise<OEmbedResponse | null> {
	try {
		const normalized = normalizeUrl(url);
		const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`;
		const response = await requestUrl({ url: endpoint });
		return response.json as OEmbedResponse;
	} catch {
		return null;
	}
}

function buildLink(info: OEmbedResponse, format: PluginSettings['linkFormat'], url: string): string {
	if (format === 'embed') return `![${info.author_name}: ${info.title}](${url})`;
	const text = format === 'title-only' ? info.title : `${info.author_name}: ${info.title}`;
	return `[${text}](${url})`;
}

export default class YouTubeLinkPlugin extends Plugin {
	settings!: PluginSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingsTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor, _info: MarkdownView | MarkdownFileInfo) => {
				if (evt.defaultPrevented) return;

				const text = evt.clipboardData?.getData('text/plain')?.trim();
				if (!text) return;

				const url = extractYouTubeUrl(text);
				if (!url) return;

				evt.preventDefault();

				const cursor = editor.getCursor();
				const placeholder = this.settings.showLoadingText ? `[Loading...](${url})` : url;
				editor.replaceRange(placeholder, cursor);
				editor.setCursor({ line: cursor.line, ch: cursor.ch + placeholder.length });

				void this.fetchAndReplace(editor, cursor, placeholder, url);
			}),
		);
	}

	private async fetchAndReplace(
		editor: Editor,
		startCursor: { line: number; ch: number },
		placeholder: string,
		url: string,
	) {
		const info = await fetchVideoInfo(url);
		const placeholderStart = this.findPlaceholderPosition(editor, startCursor, placeholder);

		if (placeholderStart === null) return;

		const endCursor = {
			line: placeholderStart.line,
			ch: placeholderStart.ch + placeholder.length,
		};

		const normalized = normalizeUrl(url);
		if (info) {
			const finalLink = buildLink(info, this.settings.linkFormat, normalized);
			editor.replaceRange(finalLink, placeholderStart, endCursor);
			editor.setCursor({ line: placeholderStart.line, ch: placeholderStart.ch + finalLink.length });
		} else {
			const fallback = `[${normalized}](${normalized})`;
			editor.replaceRange(fallback, placeholderStart, endCursor);
			editor.setCursor({ line: placeholderStart.line, ch: placeholderStart.ch + fallback.length });
		}
	}

	private findPlaceholderPosition(
		editor: Editor,
		hint: { line: number; ch: number },
		placeholder: string,
	): { line: number; ch: number } | null {
		const lineCount = editor.lineCount();
		for (let i = hint.line; i < Math.min(hint.line + 5, lineCount); i++) {
			const lineText = editor.getLine(i);
			const idx = lineText.indexOf(placeholder);
			if (idx !== -1) return { line: i, ch: idx };
		}
		for (let i = Math.max(0, hint.line - 2); i < hint.line; i++) {
			const lineText = editor.getLine(i);
			const idx = lineText.indexOf(placeholder);
			if (idx !== -1) return { line: i, ch: idx };
		}
		return null;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<PluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
