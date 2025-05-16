import { TFile, normalizePath, Notice } from 'obsidian';
import MacroPlugin from 'src/plugin';
import MacroStore from 'src/data/macroStore';

interface MacroData {
	[key: string]: string;
}

const FILEPATH = '_macros.md';

export class FileMacroStore implements MacroStore {

	private plugin: MacroPlugin;
	private macros: MacroData;

	constructor(plugin: MacroPlugin) {
		this.plugin = plugin;
	}

	async init(): Promise<void> {
		await this.loadMacros();
	}

	private get filePath(): string {
		return normalizePath(FILEPATH);
	}

	async loadMacros(): Promise<void> {
		const file = this.plugin.app.vault.getAbstractFileByPath(this.filePath);
		if (file instanceof TFile) {
			const content = await this.plugin.app.vault.read(file);
			try {
				this.macros = JSON.parse(content);
			} catch (e) {
				console.error(`Failed to load macros from file: ${e}`);
				this.macros = {};
			}
		} else {
			try {
				this.plugin.app.vault.create(this.filePath, '{}');
				this.macros = {};
			} catch (e) {
				console.error(`Failed to create macro file at filePath: ${e}`);
				this.macros = {};
			}
		}
	}

	async saveMacros(macros?: Record<string, string>): Promise<void> {
		if (macros) {
			this.macros = macros;
		}
		const curFile = this.plugin.app.vault.getAbstractFileByPath(this.filePath);
		const content = JSON.stringify(this.macros, null, 2);

		try {
			if (curFile instanceof TFile) {
				await this.plugin.app.vault.modify(curFile, content);
			} else {
				await this.plugin.app.vault.create(this.filePath, content);
			}
		} catch (e) {
			console.error(`Failed to save macro file: ${e}`);
			new Notice('Failed to save macros to file. Check console for details.');
		}
	}

	async getAllMacros(): Promise<Record<string, string>> {
		return { ...this.macros };
	}

	getMacro(key: string): string | undefined {
		return this.macros[key];
	}

	async addMacro(key: string, value: string): Promise<void> {
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

