import { MarkdownPostProcessorContext, App, Component } from 'obsidian';
import { getAllMatches, renderInlineMarkdown } from 'src/utils';

export async function applyMacrosToRenderedElement(
  el: HTMLElement,
  macros: Record<string, string>,
  macroFormat: string,
  app: App,
  sourcePath: string,
  component: Component,
  customMacroFormat?: string
): Promise<void> {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);

  const textNodes: Text[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
      textNodes.push(node as Text);
    }
  }

  for (const textNode of textNodes) {
    const text = textNode.nodeValue!;
    const matches = getAllMatches(text, macros, macroFormat, customMacroFormat);

    if (matches.length === 0) continue;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    for (const match of matches) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
      }

      const rendered = await renderInlineMarkdown(match.value, app, sourcePath, component);
      fragment.appendChild(rendered);

      lastIndex = match.index + match.matchText.length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.replaceWith(fragment);
  }
}

