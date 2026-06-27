import { App, PluginSettingTab, Setting } from 'obsidian';
import YouTubeLinkPlugin from './main';

export interface PluginSettings {
	showLoadingText: boolean;
	linkFormat: 'channel-title' | 'title-only';
}

export const DEFAULT_SETTINGS: PluginSettings = {
	showLoadingText: true,
	linkFormat: 'channel-title',
};

export class SettingsTab extends PluginSettingTab {
	plugin: YouTubeLinkPlugin;

	constructor(app: App, plugin: YouTubeLinkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Show loading text')
			.setDesc('Show "Loading..." as a placeholder while fetching video info.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showLoadingText)
					.onChange(async (value) => {
						this.plugin.settings.showLoadingText = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('Link format')
			.setDesc('How the link is displayed after pasting.')
			.addDropdown((dropdown) =>
				dropdown
					.addOption('channel-title', 'Channel: Video Title')
					.addOption('title-only', 'Video Title only')
					.setValue(this.plugin.settings.linkFormat)
					.onChange(async (value) => {
						this.plugin.settings.linkFormat = value as PluginSettings['linkFormat'];
						await this.plugin.saveSettings();
					}),
			);
	}
}
