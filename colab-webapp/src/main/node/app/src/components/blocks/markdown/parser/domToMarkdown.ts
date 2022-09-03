/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {getLogger} from '../../../../logger';
import {HeadingLevel} from './markdownToDom';

const logger = getLogger('Dom2Markdown2Parser');
logger.setLevel(4);

interface DomParserContext {
  current: number;
  anchor: number | undefined;
  focus: number | undefined;
  heading?: boolean;
  em?: boolean;
  strong?: boolean;
  strike?: boolean;
  u?: boolean;
  list: ('ul' | 'ol')[];
}

export interface Position {
  element: Node;
  offset: number;
}

function escapeText(text: string | null): string {
  if (!text) {
    return '';
  }

  const result: string[] = [];
  for (const char of text) {
    if (
      char === '*' ||
      char === '_' ||
      char === '~' ||
      char == '/' ||
      char === '[' ||
      char === ']' ||
      char === '(' ||
      char === ')'
    ) {
      result.push('\\');
    }

    result.push(char);
  }
  return result.join('');
}

function convertTable(table: Element) {
  const md: string[] = [];
  const line: string[] = [];

  function processElement(element: Element) {
    element.childNodes.forEach(child => {
      if (child instanceof Element) {
        const tag = child.tagName;
        if (tag === 'TH') {
          line.push(`*${child.textContent ?? ''}*`);
        } else if (tag === 'TD') {
          line.push(child.textContent ?? '');
        } else if (tag === 'TR') {
          processElement(child);

          if (md.length > 0) {
            md.push('\n');
          }
          md.push(line.join(' '));
          line.length = 0;
        } else {
          processElement(child);
        }
      }
    });
  }
  processElement(table);

  return md.join('');
}

function processChildren(
  element: Element,
  selection: Selection | null,
  context: DomParserContext,
): string {
  const md: string[] = [];

  const anchorElemOffset = selection?.anchorNode === element ? selection.anchorOffset : undefined;
  const focusElemOffset = selection?.focusNode === element ? selection.focusOffset : undefined;

  element.childNodes.forEach((node, nodeIndex) => {
    if (anchorElemOffset === nodeIndex) {
      context.anchor = context.current;
    }
    if (focusElemOffset === nodeIndex) {
      context.focus = context.current;
    }

    if (node instanceof Text) {
      if (node.textContent) {
        const anchor = selection?.anchorNode === node ? selection.anchorOffset : undefined;
        const focus = selection?.focusNode === node ? selection.focusOffset : undefined;

        let i = 0;
        for (const char of node.textContent) {
          logger.trace('Range | anchor | focus: ', i, context, anchor, focus);
          if (anchor === i) {
            context.anchor = context.current;
            logger.trace('Reach Anchor: ', i, context, anchor, focus);
          }

          if (focus === i) {
            context.focus = context.current;
            logger.trace('Reach Focus: ', i, context, anchor, focus);
          }

          if (
            char === '*' ||
            char === '_' ||
            char === '~' ||
            char == '/' ||
            char === '[' ||
            char === ']' ||
            char === '(' ||
            char === ')'
          ) {
            context.current++;
            logger.trace('Escaped: ', i, context, anchor, focus);
            md.push('\\');
          }

          context.current++;
          md.push(char);
          i++;
        }
        if (anchor === i) {
          context.anchor = context.current;
        }
        if (focus === i) {
          context.focus = context.current;
        }
      }
    } else if (node instanceof Element) {
      // if last child is a <BR />, it should be ignored
      if (node != element.lastChild || node instanceof HTMLBRElement === false) {
        md.push(_domToMarkdown(node, selection, context));
      }
    }
  });

  if (anchorElemOffset === element.childNodes.length) {
    context.anchor = context.current;
  }
  if (focusElemOffset === element.childNodes.length) {
    context.focus = context.current;
  }

  return md.join('');
}

const tagHeaderRegex = /^H([1-5])$/;

function isHeader(tag: string): number | undefined {
  const result = tagHeaderRegex.exec(tag);
  if (result != null && result.length == 2) {
    return +result[1]! as HeadingLevel;
  }
  return undefined;
}

function _domToMarkdown(
  elementArg: Element | null,
  selection: Selection | null,
  context: DomParserContext,
): string {
  if (elementArg == null) {
    return '';
  }

  const element = elementArg;

  const md: string[] = [];
  const tag = element.tagName;

  function push(content: string) {
    md.push(content);
    context.current += content.length;
  }

  function process(
    localCtx: 'em' | 'u' | 'strike' | 'strong' | 'heading',
    start: string,
    stop: string,
  ) {
    if (context[localCtx]) {
      // local context already active
      md.push(processChildren(element, selection, context));
    } else {
      push(start);
      context[localCtx] = true;
      md.push(processChildren(element, selection, context));
      context[localCtx] = false;
      push(stop);
    }
  }

  logger.trace('Parser: ', tag);

  const headerLevel = isHeader(tag);
  if (headerLevel != null) {
    if (context.current > 0) {
      push('\n');
    }
    process('heading', `${'#'.repeat(headerLevel)} `, '');
  } else {
    if (tag === 'SPAN') {
      md.push(processChildren(element, selection, context));
    } else if (
      tag === 'P' ||
      tag === 'DIV' ||
      tag === 'SECTION' ||
      tag === 'ACTICLE' ||
      tag === 'HEADER' ||
      tag === 'FOOTER'
    ) {
      if (context.current > 0) {
        // hack no newline within lists
        if (context.list.length === 0) {
          push('\n');
        }
      }
      // detect and skip emptiness (<p><br/></p> is quite normal to reprensent one single empty line)
      if (element.childNodes.length !== 1 || element.firstChild instanceof HTMLBRElement === false) {
        md.push(processChildren(element, selection, context));
      }
    } else if (tag === 'STRONG' || tag === 'B') {
      if (element.textContent) {
        process('strong', '**', '**');
      }
    } else if (tag === 'STRIKE') {
      if (element.textContent) {
        process('strike', '~', '~');
      }
    } else if (tag === 'EM' || tag === 'I') {
      if (element.textContent) {
        process('em', '/', '/');
      }
    } else if (tag === 'U') {
      if (element.textContent) {
        process('u', '_', '_');
      }
    } else if (tag === 'UL') {
      context.list.push('ul');
      md.push(processChildren(element, selection, context));
      context.list.pop();
    } else if (tag === 'OL') {
      context.list.push('ol');
      md.push(processChildren(element, selection, context));
      context.list.pop();
    } else if (tag === 'LI') {
      const currentList = context.list[context.list.length - 1];
      if (currentList) {
        if (context.current > 0) {
          push('\n');
        }
        push('  '.repeat(context.list.length - 1));
        const listType = element.getAttribute('data-list-type');
        if (listType === 'OL') {
          // TODO: fetch start number
          push('1. ');
        } else {
          const checked = element.getAttribute('data-checked');
          if (checked == null) {
            push('- ');
          } else {
            push(`- [${checked === 'DONE' ? 'x' : ' '}] `);
          }
        }
        md.push(processChildren(element, selection, context));
      }
    } else if (tag === 'PRE') {
      if (context.current > 0) {
        push('\n');
      }
      const lang = element.getAttribute('data-lang') || '';
      push(`\`\`\`${lang}\n`);
      push(element.textContent || '');
      push('\n```');
    } else if (tag === 'BR') {
      push('\n ');
    } else if (tag === 'A') {
      // convert links to markdown: [link label](url)
      const url = element.getAttribute('href');
      const label = element.textContent;
      const data = `[${escapeText(label)}](${escapeText(url)})`;
      push(data);
    } else if (tag === 'IMG') {
      // convert links to markdown: [link label](url)
      const src = element.getAttribute('src');
      const label = element.getAttribute('alt');
      const data = `![${escapeText(label)}](${escapeText(src)})`;
      push(data);
    } else if (tag === 'TABLE') {
      logger.warn('TABLE');
      const text = convertTable(element);
      push(text);
    } else {
      logger.info('Unhandled tag', tag, '=>', element.textContent, '<=');
    }
  }
  return md.join('');
}

export interface MarkdownRange {
  anchor: number | undefined;
  focus: number | undefined;
}

export interface MarkdownWithSelection {
  data: string;
  range: MarkdownRange;
}

export default function domToMarkdown(element: Element | null): MarkdownWithSelection {
  const selection = window.getSelection();
  const context: DomParserContext = {
    current: 0,
    anchor: undefined,
    focus: undefined,
    list: [],
  };

  const result = _domToMarkdown(element, selection, context);

  return {
    data: result,
    range: {
      anchor: context.anchor,
      focus: context.focus,
    },
  };
}
