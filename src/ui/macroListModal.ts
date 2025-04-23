import { App, Modal, Setting } from 'obsidian';

export default class MacroListModal extends Modal {
	constructor(app: App, private macros: Record<string, string>) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Existing Macros' });

		if (Object.keys(this.macros).length === 0) {
			contentEl.createEl('p', { text: 'No macros found.' });
			return;
		}

		Object.entries(this.macros).forEach(([key, value]) => {
			new Setting(contentEl)
				.setName(key)
				.setDesc(value);
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}
