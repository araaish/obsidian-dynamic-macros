import { Notice, PluginSettingTab, App, Setting } from 'obsidian';
import MacroPlugin from 'src/plugin'; // Import the main plugin class for saving/loading settings

type MacroStorage = 'settings' | 'file';

export interface MacroPluginSettings {
	macroFormat: string;        // The macro format (e.g., "{{}}", "@@@@")
	editorMacroUpdate: string;  // Option to enable/disable macro updating in the editor
	macroStorage: MacroStorage;  // storage method
	customMacroFormat?: string;	// Optional: Regex for custom format provided by user
}

export const DEFAULT_SETTINGS: MacroPluginSettings = {
	macroFormat: '{{}}',
	editorMacroUpdate: 'disabled',
	macroStorage: 'settings'
};

export class MacroPluginSettingTab extends PluginSettingTab {
	private plugin: MacroPlugin;

	constructor(app: App, plugin: MacroPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Macro Plugin Settings" });

		new Setting(containerEl)
			.setName("Macro Format")
			.setDesc("Choose the format for macro keys (e.g., {{MACRO_KEY}} or <<MACRO_KEY>>).")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("{{}}", "{{MACRO_KEY}}")
					.addOption("@@@@", "@@MACRO_KEY@@")
					.addOption('custom', 'Custom (Enter Regex)')
					.setValue(this.plugin.settings.macroFormat)
					.onChange(async (value) => {
						this.plugin.settings.macroFormat = value;
						await this.plugin.saveSettings();

						customRegexSetting.setDisabled(value !== 'custom')
					})
			);

		new Setting(containerEl)
			.setName('Storage Location')
			.setDesc('Choose where to store macros.')
			.addDropdown((dropdown) => {
				dropdown
					.addOption('settings', 'Plugin Settings (Default)')
					.addOption('file', 'File')
					.setValue(this.plugin.settings.macroStorage)
					.onChange(async (value: MacroStorage) => {
						this.plugin.settings.macroStorage = value
						await this.plugin.saveSettings();
						this.plugin.switchMacroStore();
						console.log('switched macroStore');
						console.log('new store = ', this.plugin.settings.macroStorage);
					});
			});


		const customRegexSetting = new Setting(containerEl)
			.setName("Custom Macro Format")
			.setDesc("Enter a custom regex pattern for macros.")
			.addText((text) => {
				text
					.setPlaceholder("e.g., \\[\\[(.*?)\\]\\]")
					.setValue(this.plugin.settings.customMacroFormat || "")
					.onChange(async (value) => {
						this.plugin.settings.customMacroFormat = value;
						await this.plugin.saveSettings();
					});
			})
			.setDisabled(this.plugin.settings.macroFormat !== "custom");
	}
}

