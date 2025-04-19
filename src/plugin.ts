import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import { MacroPluginSettingTab, MacroPluginSettings, DEFAULT_SETTINGS } from 'src/settings';
import MacroStore from 'src/data/macroStore';
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
			// Get macros from the MacroStore (adjust as per your actual setup)
			const macros = await this.macroStore.getAllMacros();
			
			// Call the function to apply macros to the rendered markdown
			await applyMacrosToRenderedElement(
			  el,
			  macros,
			  this.settings.macroFormat,
			  this.app, // Pass the app instance
			  this.getSourcePath(ctx), // Optionally, pass the source path (adjust as needed)
			  this, // This is the parent component (usually `this` in a plugin)
			  this.settings.customMacroFormat
			);
		  });
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

	getMacroStore() {
		return this.macroStore;
	}

	getSourcePath(ctx: MarkdownPostProcessorContext): string {
		// Access the source path from the context (e.g., ctx.sourcePath)
		return ctx.sourcePath || "unknown.md"; // Fallback to "unknown.md" if not available
	}
}

