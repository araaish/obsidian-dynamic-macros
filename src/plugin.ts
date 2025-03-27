import { Plugin } from 'obsidian';
import { MacroPluginSettingTab, MacroPluginSettings, DEFAULT_SETTINGS } from './settings';
import { MacroStore } from 'src/data/macroStore';
import { SettingsMacroStore } from 'src/data/settingsMacroStore';
import { addCommands } from 'src/commands';

// TODO: Remember to rename these classes and interfaces!


export default class MacroPlugin extends Plugin {
	settings: MacroPluginSettings;
	private macroStore: MacroStore;

	async onload() {
		await this.loadSettings();

		await this.initializeMacroStore();

		addCommands(this);

		this.addSettingTab(new MacroPluginSettingTab(this.app, this));

	}

	onunload() {

	}

	// TODO: update to handle other storage methods
	async loadSettings() {
        try {
			const data = await this.loadData();
			this.settings = { ...DEFAULT_SETTINGS, ...data?.settings };
		} catch (error) {
			console.error("Error loading settings. Using default settings.", error);
            this.settings = DEFAULT_SETTINGS;
        }
    }

	// TODO: same as loadSettings
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

