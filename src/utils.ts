import { App } from 'obsidian';
import PromptModal from 'src/ui/promptModal';

export async function promptUserForInput(app: App, message: string): Promise<string> {
	return new Promise((resolve) => {
	new PromptModal(app, message, resolve).open();
	});
}


export function getAllMatches(
  text: string,
  macros: Record<string, string>,
  macroFormat: string,
): { key: string; value: string; matchText: string; index: number }[] {
  const matches: { key: string; value: string; matchText: string; index: number }[] = [];

  // If we have a custom regex, treat it as a regex pattern
  if (macroFormat.startsWith("/") && macroFormat.endsWith("/")) {
    try {
      const regex = new RegExp(macroFormat.slice(1, -1), "g");
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          key: match[0],
          value: macros[match[0]] || "", // Match value for the macro
          matchText: match[0],
          index: match.index
        });
      }
    } catch (e) {
      console.error("Invalid custom regex:", e);
    }
  } else {
    // Otherwise, treat macroFormat as a plain string template (e.g., {{KEY}})
    for (const [key, value] of Object.entries(macros)) {
      const wrappedKey = macroFormat.replace("KEY", key);
      let idx = text.indexOf(wrappedKey);
      while (idx !== -1) {
        matches.push({
          key,
          value,
          matchText: wrappedKey,
          index: idx
        });
        idx = text.indexOf(wrappedKey, idx + wrappedKey.length);
      }
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}
