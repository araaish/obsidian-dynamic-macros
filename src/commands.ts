import { Plugin } from 'obsidian';
import MacroModal from 'src/ui/macroModal';
import { MacroStore } from 'src/data/macroStore';
import { promptUserForInput } from 'src/utils';

export function addCommands(plugin: Plugin) {
	macroStore = plugin.macroStore;

	plugin.addCommand({
		id: 'create-macro',
		name: 'Create New Macro',
		callback: () => {
			new MacroModal(plugin.app, macroStore).open();
		}
	});

	plugin.addCommand({
		id: 'list-macros',
		name: 'List Existing Macros',
		callback: async () => {
			const macros = await macroStore.getAllMacros();
			if (Object.keys(macros).length == 0) {
				new Notice('No macros found.');
				return;
			} else {
				const macroList = Object.entries(macros)
					.map(([key, value]) => `- **${key}** -> ${value}`)
					.join('\n');
				// TODO: instead of notice, use MacroListModal
				new Notice(`Available Macros: \n${macroList}`);
			}
		}
	});

	plugin.addCommand({
		id: 'delete-macro',
		name: 'Delete Macro',
		callback: async () => {
			const macros = await macroStore.getAllMacros();
			if (Object.keys(macros).length == 0) {
				new Notice('No macros found.');
				return;
			}

			const macroKey = await promptUserForInput(plugin.app, 'Enter the macro key to delete:');
			if (macroKey in macros) {
				await macroStore.deleteMacro(macroKey);
				new Notice(`Macro "${macroKey}" deleted successfully.`);
			} else {
				new Notice(`Macro "${macroKey}" not found.`);
			}
		}
	});
}

