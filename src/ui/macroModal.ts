import { App, Modal, Setting, Notice } from 'obsidian';
import MacroStore from 'src/data/macroStore';

export default class MacroModal extends Modal {
	private macroStore: MacroStore;
	private key: string = '';
	private value: string = '';

	constructor(app: App, macroStore: MacroStore) {
		super(app);
		this.macroStore = macroStore;
	}
	
	onOpen() {
		const { contentEl } = this;
		contentEl.empty()

		contentEl.createEl('h2', { text: 'Create or Edit Macro'});

		new Setting(contentEl)
			.setName('Macro Key')
			.setDesc('Enter a unique key for the macro (e.g. API_KEY).')
			.addText((text) =>
				text.onChange((value) => {
					this.key = value.trim();
				})
			);

		new Setting(contentEl)
			.setName('Macro Value')
			.setDesc('Enter the markdown expression to be inserted.')
			.addText((text) =>
				text.onChange((value) => {
					this.value = value.trim();
				})
			);

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText('Save Macro')
					.setCta()
					.onClick(async () => {
						if (!this.key || !this.value) {
							new Notice('Macro key and value cannot be empty.')
							return;
						}

						await this.macroStore.addMacro(this.key, this.value)
						new Notice(`Macro "${this.key}" saved successfully.`);
						this.close();
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

