import { Plugin } from 'obsidian';
import { MacroPluginSettings } from 'src/settings';

interface MacroData {
	[key: string]: string;
}

export class SettingsMacroStore implements MacroStore {
	private plugin: Plugin;
	private macros: MacroData;

	constructor(plugin: Plugin) {
		this.plugin = plugin;
		this.loadMacros();
	}

	async loadMacros() {
		try {
			const data = await this.plugin.loadData();
			this.macros = data?.macros || {};
		} catch (error) {
			console.error('Error loading macros. Using empty set.');
			this.macros = {};
		}
	}
	
	async saveMacros() {
		await this.plugin.saveData({
			settings: this.plugin.settings,
			macros: this.macros,
		});
	}

    async getAllMacros(): Promise<MacroData> {
        return this.macros;
    }

    getMacro(key: string): string | undefined {
        return this.macros[key];
    }

    async addMacro(key: string, value: string) {
        this.macros[key] = value;
        await this.saveMacros();
    }

    async deleteMacro(key: string): Promise<boolean> {
        if (key in this.macros) {
            delete this.macros[key];
            await this.saveMacros();
            return true;
        }
        return false;
    }
}

