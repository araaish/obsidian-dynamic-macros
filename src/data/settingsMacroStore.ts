import MacroPlugin from 'src/plugin';
import MacroStore from 'src/data/macroStore';

interface MacroData {
	[key: string]: string;
}

export class SettingsMacroStore implements MacroStore {
	private plugin: MacroPlugin;
	private macros: MacroData;

	constructor(plugin: MacroPlugin) {
		this.plugin = plugin;
	}

	async init(): Promise<void> {
		await this.loadMacros();
	}

	async loadMacros() {
		try {
			const data = await this.plugin.loadData();
			this.macros = data?.macros || {};
		} catch (error) {
			this.macros = {};
		}
	}

	async saveMacros(macros?: Record<string, string>) {
		if (macros) {
			this.macros = macros
		}
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
