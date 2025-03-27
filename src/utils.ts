import { App } from 'obsidian';
import PromptModal from 'src/ui/promptModal';

export async function promptUserForInput(app: App, message: string): Promise<string> {
	return new Promise((resolve) => {
	new PromptModal(app, message, resolve).open();
	});
}

