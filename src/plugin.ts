import { Plugin } from 'obsidian';
import { MacroPluginSettingTab, MacroPluginSettings, DEFAULT_SETTINGS } from './settings';
import { MacroStore } from 'src/data/macroStore';
import { SettingsMacroStore } from 'src/data/settingsMacroStore';
import { addCommands } from 'src/commands';
import { applyMacrosToRenderedElement } from 'src/processor';

export default class MacroPlugin extends Plugin {
	settings: MacroPluginSettings;
	private macroStore: MacroStore;

	async onload() {
		await this.loadSettings();

		await this.initializeMacroStore();

		addCommands(this);

		this.addSettingTab(new MacroPluginSettingTab(this.app, this));
			
		this.registerMarkdownPostProcessor(async (el, ctx) => {
			if (!this.settings.editorMacroUpdate) return;

			// Determine the format: use 'custom' format if selected
			let macroFormat = this.settings.macroFormat;
			console.log('macroFormat: ', macroFormat)

			if (macroFormat === "custom") {
				macroFormat = this.settings.customMacroFormat; // Use the regex string from the custom format
				if (!macroFormat) {
					console.error("Custom macro format is empty");
					return;
				}
			}

			const macros = await this.macroStore.getAllMacros();

			await applyMacrosToRenderedElement(
				el,
				ctx,
				macros,
				macroFormat,  // Pass the final format (either custom regex or default format)
			);
		});
	}

	onunload() {

	}

	// NOTE: update to handle other storage methods
	async loadSettings() {
        try {
			const data = await this.loadData();
			this.settings = { ...DEFAULT_SETTINGS, ...data?.settings };
		} catch (error) {
			console.error("Error loading settings. Using default settings.", error);
            this.settings = DEFAULT_SETTINGS;
        }
    }

	// NOTE: same as loadSettings
    async saveSettings() {
        await this.saveData({
			settings: this.settings,
			macros: this.macroStore.getAllMacros(),
		});
    }

	async initializeMacroStore() {
	    if (this.settings.macroStorage === "file") {
		    // this.macroStore = new FileMacroStore(this.app);
		} else if (this.settings.macroStorage === "indexeddb") {
			// this.macroStore = new IndexedDBMacroStore();
		} else {
			this.macroStore = new SettingsMacroStore(this);
		}
	}
}

