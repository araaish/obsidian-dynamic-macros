import { MarkdownPostProcessorContext, MarkdownRenderer, App, Component } from 'obsidian';
import { getAllMatches} from 'src/utils';

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

      const html = await renderMarkdownToElement(match.value, app, sourcePath, component);
      fragment.appendChild(html);

      lastIndex = match.index + match.matchText.length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.replaceWith(fragment);
  }
}

// Render markdown content as HTML inside a temporary div
async function renderMarkdownToElement(
  markdown: string,
  app: App,
  sourcePath: string,
  component: Component
): Promise<DocumentFragment> {
  const tempDiv = createDiv();
  await MarkdownRenderer.render(app, markdown, tempDiv, sourcePath, component);
  const fragment = document.createDocumentFragment();
  Array.from(tempDiv.childNodes).forEach((node) => fragment.appendChild(node));
  return fragment;
}
