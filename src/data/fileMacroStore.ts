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
		console.log('filepath: ', this.filePath);
		console.log('file: ', file);
		if (file instanceof TFile) {
			const content = await this.plugin.app.vault.read(file);
			console.log('file content: ', content);
			try {
				this.macros = JSON.parse(content);
				console.log('loaded macros from file', this.macros);
			} catch (e) {
				console.error(`Failed to load macros from file: ${e}`);
				this.macros = {};
			}
		} else {
			console.log('file was not of TFile type');
			try {
				this.plugin.app.vault.create(this.filePath, '{}');
				this.macros = {};
				console.log('created fresh macro file');
			} catch (e) {
				console.error(`Failed to create macro file at filePath: ${e}`);
				this.macros = {};
			}
		}
	}

	async saveMacros(macros?: Record<string, string>): Promise<void> {
		if (macros) {
			this.macros = macros;
			console.log('saving macros from memory');
		}
		console.log('saving macros to filepath: ', this.filePath);
		const curFile = this.plugin.app.vault.getAbstractFileByPath(this.filePath);
		console.log('curFile: ', curFile);
		const content = JSON.stringify(this.macros, null, 2);
		console.log('content: ', content);

		try {
			if (curFile instanceof TFile) {
				await this.plugin.app.vault.modify(curFile, content);
				console.log('successfully modified macro file');
			} else {
				await this.plugin.app.vault.create(this.filePath, content);
				console.log('successfully created new macrofile');
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

