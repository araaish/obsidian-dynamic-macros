export default interface MacroStore {
	init(): Promise<void>;
	loadMacros(): Promise<void>;
	saveMacros(macros?: Record<string, string>): Promise<void>;
	getAllMacros(): Promise<Record<string, string>>;
	getMacro(key: string): string | undefined;
	addMacro(key: string, value: string): Promise<void>;
	deleteMacro(key: string): Promise<boolean>;
}
