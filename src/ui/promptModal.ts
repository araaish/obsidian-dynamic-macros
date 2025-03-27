import { App, Modal, Setting } from 'obsidian';

export default class PromptModal extends Modal {
	private promptText: string;
	private onSubmit: (input: string) => void;
	private inputValue: string = '';

	constructor(app: App, promptText: string, onSubmit: (input: string) => void) {
		super(app);
		this.promptText = promptText;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: this.promptText });

		new Setting(contentEl)
			.addText((text) =>
				text.onChange((value) => {
					this.inputValue = value.trim();
				})
			)
			.addButton((btn) =>
				btn
					.setButtonText('Submit')
					.setCta()
					.onClick(() => {
						if (this.inputValue) {
							this.onSubmit(this.inputValue);
							this.close()
						}
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

