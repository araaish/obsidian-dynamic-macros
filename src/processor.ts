import { MarkdownRenderer } from 'obsidian';
import { getAllMatches} from 'src/utils';

export async function applyMacrosToRenderedElement(
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext,
  macros: Record<string, string>,
  macroFormat: string,
  useRegex: boolean
) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let node: Text;

  while ((node = walker.nextNode() as Text)) {
    const parent = node.parentElement;
    if (!parent || ["CODE", "PRE", "A"].includes(parent.tagName)) continue;

    const text = node.nodeValue;
    if (!text) continue;

    const matches = getAllMatches(text, macros, macroFormat, useRegex);
    if (matches.length === 0) continue;

    const wrapper = document.createElement("span");
    parent.replaceChild(wrapper, node);

    let lastIndex = 0;
    for (const match of matches) {
      if (match.index > lastIndex) {
        wrapper.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      const rendered = document.createElement("span");
      await MarkdownRenderer.renderMarkdown(match.value, rendered, ctx.sourcePath, ctx);
      wrapper.appendChild(rendered);

      lastIndex = match.index + match.matchText.length;
    }

    if (lastIndex < text.length) {
      wrapper.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
  }
}
