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
  customMacroFormat?: string
): { key: string; value: string; matchText: string; index: number }[] {
  const matches: { key: string; value: string; matchText: string; index: number }[] = [];

  if (macroFormat === "custom" && customMacroFormat) {
    try {
      const regex = new RegExp(customMacroFormat, "g");
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const matchedKey = match[1] || match[0];
        matches.push({
          key: matchedKey,
          value: macros[matchedKey] ?? "",
          matchText: match[0],
          index: match.index,
        });
      }
    } catch (e) {
      console.error("Invalid custom regex:", e);
    }
  } else {
    const wrap = macroFormat === '{{}}' ? (key: string) => `{{${key}}}` :
                 macroFormat === '<<>>'   ? (key: string) => `<<${key}>>` :
                 (key: string) => key;

    for (const [key, value] of Object.entries(macros)) {
      const wrappedKey = wrap(key);
      let idx = text.indexOf(wrappedKey);
      while (idx !== -1) {
        matches.push({
          key,
          value,
          matchText: wrappedKey,
          index: idx,
        });
        idx = text.indexOf(wrappedKey, idx + wrappedKey.length);
      }
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}
