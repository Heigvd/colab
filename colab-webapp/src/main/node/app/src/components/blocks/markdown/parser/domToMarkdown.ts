/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { getLogger } from '../../../../logger';
import { HeadingLevel } from './markdownToDom';

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

function processChildren(
  element: Element,
  selection: Selection | null,
  context: DomParserContext,
): string {
  const md: string[] = [];

  element.childNodes.forEach(node => {
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

          if (char === '*' || char === '_' || char === '~' || char == '/') {
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
      md.push(_domToMarkdown(node, selection, context));
    }
  });

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
    } else if (tag === 'P' || tag === 'DIV') {
      if (context.current > 0) {
        push('\n');
      }
      md.push(processChildren(element, selection, context));
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
        if (currentList === 'ol') {
          // TODO: fetch start number
          push('1. ');
        } else {
          const checked = elementArg.getAttribute('data-checked');
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
      push(elementArg.textContent || '');
      push('\n```');
    } else if (tag === 'BR') {
      push('\n ');
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
