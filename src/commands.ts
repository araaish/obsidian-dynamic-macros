import { Notice } from 'obsidian';
import MacroPlugin from 'src/plugin';
import MacroModal from 'src/ui/macroModal';
import MacroListModal from 'src/ui/macroListModal';
import { promptUserForInput } from 'src/utils';

export function addCommands(plugin: MacroPlugin) {
	plugin.addCommand({
		id: 'create-macro',
		name: 'Create Macro',
		callback: () => {
			new MacroModal(plugin.app, plugin.getMacroStore()).open();
		}
	});

	plugin.addCommand({
		id: 'list-macros',
		name: 'List Macros',
		callback: async () => {
			const macros = await plugin.getMacroStore().getAllMacros();
			if (Object.keys(macros).length == 0) {
				new Notice('No macros found.');
				return;
			} else {
				new MacroListModal(this.app, macros).open();
			}
		}
	});

	plugin.addCommand({
		id: 'delete-macro',
		name: 'Delete Macro',
		callback: async () => {
			const macros = await plugin.getMacroStore().getAllMacros();
			if (Object.keys(macros).length == 0) {
				new Notice('No macros found.');
				return;
			}

			const macroKey = await promptUserForInput(plugin.app, 'Enter the macro key to delete:');
			if (macroKey in macros) {
				await plugin.getMacroStore().deleteMacro(macroKey);
				new Notice(`Macro "${macroKey}" deleted successfully.`);
			} else {
				new Notice(`Macro "${macroKey}" not found.`);
			}
		}
	});
}

