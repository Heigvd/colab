/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { getLogger } from '../../../../logger';
import { MarkdownRange } from './domToMarkdown';

const logger = getLogger('Markdown2DomParser');
logger.setLevel(4);

// detect lines and indentation levels
// A line may be :
//  -> a UL item "* Item 1" with any indentation level,
//  -> a OL item "1. Item 1" with any indentation level
//  -> a todo item: "* []

// const newMajorBlockDetector = /(?:^(?! ))/; // New line which starts with non-space character

const regexBuilder = () => {
  // seems some odd browsers do not support negative lookbehind group...
  // current mitigation: delay regexp instantiation so the whole app won't crash...
  // TODO: fix safari
  // TODO: do not use lookbehind groups
  let linesRegex: RegExp;

  /** two consecutive unescaped '*' */
  let boldRegex: RegExp;

  /** one unescaped '/' */
  let italicRegex: RegExp;

  /** one unescaped unescaped '~'  */
  let strikethroughRegex: RegExp;

  /** one unescaped unescaped '_' */
  let underlineRegex: RegExp;

  return () => {
    if (!boldRegex) {
      boldRegex = new RegExp('(?<!\\\\)(\\*\\*)');
    }

    if (!italicRegex) {
      italicRegex = new RegExp('(?<!\\\\)(\\/)');
    }

    if (!strikethroughRegex) {
      strikethroughRegex = new RegExp('(?<!\\\\)(~)');
    }

    if (!underlineRegex) {
      underlineRegex = new RegExp('(?<!\\\\)(_)');
    }

    if (!linesRegex) {
      linesRegex = new RegExp(
        [
          '(?<CODE>(?<codeIndent>^```(?<codeLang>.*)\n)(?<codeData>.*)\n```)',
          '(?<UL>^(?<ulIndent>(?<ulLevel> *[*-])(?: \\[(?<ulChecked>[ x])\\])? )(?<ulData>.*)$)',
          '(?<OL>^(?<olIndent>(?<olLevel> *)(?<olNumber>\\d+)\\.)(?<olData>.*)$)',
          '(?<H>^(?<hIndent>(?<hLevel>#{1,5}) ?)(?<hData>.*)$)',
          '(?<P>^(?<pIndent> *)(?<pData>.*)$)',
        ].join('|'),
        'gm',
      );
    }
    return { linesRegex, boldRegex, italicRegex, strikethroughRegex, underlineRegex };
  };
};

const getRegexes = regexBuilder();

export type HeadingLevel = 1 | 2 | 3 | 4 | 5;

interface CodeRegexGroup {
  CODE: string;
  codeIndent: string;
  codeLang: string;
  codeData: string;
}

interface HeadingLineRegexGroup {
  H: string;
  hIndent: string;
  hLevel: string;
  hData: string;
}

interface UlLineRegexGroup {
  UL: string;
  ulIndent: string;
  ulData: string;
  ulLevel: string;
  ulChecked: ' ' | 'x' | undefined;
}

interface OlLineRegexGroup {
  OL: string;
  olIndent: string;
  olLevel: string;
  olNumber: string;
  olData: string;
}

interface PLineRegexGroup {
  P: string;
  pIndent: string;
  pData: string;
}

//type LineGroup = CodeGroup HeadingLineRegexGroup | UlLineRegexGroup | OlLineRegexGroup | PLineRegexGroup;

function isCodeGroup(group: object): group is CodeRegexGroup {
  return 'CODE' in group && (group as unknown as { CODE: unknown }).CODE != null;
}

function isHeadingGroup(group: object): group is HeadingLineRegexGroup {
  return 'H' in group && (group as unknown as { H: unknown }).H != null;
}

function isUlGroup(group: object): group is UlLineRegexGroup {
  return 'UL' in group && (group as unknown as { UL: unknown }).UL != null;
}

function isOlGroup(group: object): group is OlLineRegexGroup {
  return 'OL' in group && (group as unknown as { OL: unknown }).OL != null;
}

function isPLineGroup(group: object): group is PLineRegexGroup {
  return 'P' in group && (group as unknown as { P: unknown }).P != null;
}

interface Line {
  offset: number;
  data: string;
  postOffset: number;
}

interface Multiline {
  initialMark: string;
  text: Line[];
}

interface Heading extends Multiline {
  tagType: 'Heading';
  headerLevel: HeadingLevel;
}

interface Code extends Multiline {
  tagType: 'Code';
  lang: string;
}

interface UListItem extends Multiline {
  tagType: 'UListItem';
  listLevel: number;
  checked: boolean | undefined;
}

interface OListItem extends Multiline {
  tagType: 'OListItem';
  listLevel: number;
  startNumber: number;
}

interface Paragraph extends Multiline {
  tagType: 'P';
}

type MajorTag = Code | Heading | UListItem | OListItem | Paragraph;

function getTagFromMajor(major: MajorTag): string {
  switch (major.tagType) {
    case 'Code':
      return 'PRE';
    case 'Heading':
      return `H${major.headerLevel}`;
    case 'UListItem':
      return 'LI';
    case 'OListItem':
      return 'LI';
    case 'P':
      return 'P';
  }
}

function extractMajorTags(markdown: string): MajorTag[] {
  let m: RegExpExecArray | null;
  const { linesRegex } = getRegexes();
  linesRegex.lastIndex = 0;
  const majorTags: MajorTag[] = [];

  let currentIndentation: number | undefined = undefined;

  // harvest lines and group adjacent with same indentation level
  while ((m = linesRegex.exec(markdown)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === linesRegex.lastIndex) {
      linesRegex.lastIndex++;
    }

    logger.trace('Groupe: ', m.groups);
    if (m.groups) {
      //logger.trace("GROUP");
      if (isCodeGroup(m.groups)) {
        logger.trace('Hit code: ', m.groups.codeLang, m.groups.codeData);
        currentIndentation = 0;
        majorTags.push({
          tagType: 'Code',
          initialMark: m.groups.codeIndent,
          lang: m.groups.codeLang,
          text: [
            { offset: 3 + m.groups.codeLang.length + 1, data: m.groups.codeData, postOffset: 4 },
          ],
        });
        logger.trace('CurrentLevel', currentIndentation);
      } else if (isHeadingGroup(m.groups)) {
        logger.trace('Hit heading: ', m.groups.hIndent, m.groups.hData);
        currentIndentation = m.groups.hIndent.length;
        const t: Heading = {
          tagType: 'Heading',
          initialMark: m.groups.hIndent,
          headerLevel: m.groups.hLevel.length as HeadingLevel,
          text: [{ offset: m.groups.hIndent.length, data: m.groups.hData, postOffset: 0 }],
        };
        majorTags.push(t);
        logger.trace('CurrentLevel', currentIndentation);
      } else if (isUlGroup(m.groups)) {
        logger.trace('Hit UL item');
        currentIndentation = m.groups.ulIndent.length;
        majorTags.push({
          tagType: 'UListItem',
          initialMark: m.groups.ulIndent,
          listLevel: m.groups.ulLevel.length,
          checked: m.groups.ulChecked === undefined ? undefined : m.groups.ulChecked !== ' ',
          text: [{ offset: currentIndentation, data: m.groups.ulData, postOffset: 0 }],
        });
        logger.trace('CurrentLevel', currentIndentation);
      } else if (isOlGroup(m.groups)) {
        logger.trace('Hit OL item');
        majorTags.push({
          tagType: 'OListItem',
          initialMark: m.groups.olIndent,
          listLevel: m.groups.olLevel.length + 1,
          startNumber: +m.groups.olNumber,
          text: [{ offset: currentIndentation || 0, data: m.groups.olData, postOffset: 0 }],
        });
        currentIndentation = m.groups.olIndent.length;
        logger.trace('CurrentLevel', currentIndentation);
      } else if (isPLineGroup(m.groups)) {
        const pLevel = m.groups.pIndent.length;
        logger.trace('Hit P:', pLevel, ':', m.groups.pData, currentIndentation);
        //if (pLevel > 0 && currentIndentation && pLevel >= currentIndentation) {
        if (pLevel > 0 && currentIndentation) {
          // merge line within previous group
          logger.trace('Group');
          majorTags[majorTags.length - 1]!.text.push({
            offset: pLevel,
            data: m.groups.pData,
            postOffset: 0,
          });
        } else {
          logger.trace('No Group');
          majorTags.push({
            tagType: 'P',
            initialMark: m.groups.pIndent,
            text: [
              {
                offset: 0,
                data: m.groups.P,
                postOffset: 0,
              },
            ],
          });
        }
      }
    }
  }

  return majorTags;
}

interface Combined {
  tag: string;
  initialMark: string;
  attributes: Record<string, string>;
  data: string | undefined;
  offset: number[];
  major: MajorTag;
  currentRowPosition: number;
  currentDataPosition: number;
}

function combineMultiline(majorTag: MajorTag): Combined {
  const tag = getTagFromMajor(majorTag);

  const combined = majorTag.text.reduce<Combined>(
    (acc, cur) => {
      acc.currentRowPosition += cur.offset;

      if (acc.data == null) {
        acc.data = '';
      } else {
        acc.data = `${acc.data}\n`;
        acc.offset[acc.currentDataPosition] = acc.currentRowPosition;
        acc.currentDataPosition++;
        acc.currentRowPosition++;
      }

      logger.trace('cur.data: ', cur.data);
      for (const c of cur.data) {
        acc.offset[acc.currentDataPosition] = acc.currentRowPosition;
        acc.data += c;
        acc.currentRowPosition++;
        acc.currentDataPosition++;
      }

      acc.currentRowPosition += cur.postOffset;

      return acc;
    },
    {
      tag: tag,
      initialMark: majorTag.initialMark,
      attributes: {},
      data: undefined,
      offset: [],
      major: majorTag,
      currentRowPosition: 0,
      currentDataPosition: 0,
    },
  );

  if (majorTag.tagType === 'Code') {
    combined.attributes['data-lang'] = majorTag.lang;
  } else if (majorTag.tagType === 'UListItem') {
    combined.attributes['data-list-type'] = 'UL';
    if (majorTag.checked != undefined) {
      combined.attributes['data-checked'] = majorTag.checked ? 'DONE' : 'TODO';
      combined.attributes['data-list-type'] = 'TL';
    } else {
      combined.attributes['data-list-type'] = 'UL';
    }
  } else if (majorTag.tagType === 'OListItem') {
    combined.attributes['data-list-type'] = 'OL';
  }

  logger.trace('Combined', combined);

  return combined;
}

/**
 * Make offset absolute
 */
function consolidate(combineds: Combined[]) {
  let currentRawPos = 0;
  combineds.forEach(c => {
    if (currentRawPos > 0) {
      c.offset = c.offset.map(o => o + currentRawPos);
      c.currentRowPosition += currentRawPos;
    }
    // new line
    currentRawPos = c.currentRowPosition + 1;
  });
}

function extract(
  combined: Combined,
  from: number,
  to: number,
  tag: string,
  mark: string,
): Combined {
  const extraction: Combined = {
    tag: tag,
    initialMark: mark,
    data: combined.data!.substring(from, to),
    offset: combined.offset.slice(from, to),
    major: combined.major,
    currentRowPosition: combined.currentRowPosition,
    currentDataPosition: combined.currentDataPosition,
    attributes: {},
  };
  return extraction;
}

interface NodeWithPosition {
  node: Node;
  rawPosition: number;
  consumed: number;
  combined: Combined;
}

interface DomTree {
  root: NodeWithPosition;
  all: NodeWithPosition[];
}

function processTag(
  combined: Combined,
  position: number,
  mark: string,
  markRegex: RegExp,
  tag: string,
): DomTree | false {
  const data = combined.data!.substring(position);

  if (data.startsWith(mark)) {
    logger.trace(`Start of tag ${mark} found at :${position}`);
    const markLength = mark.length;
    const sub = data.substring(markLength);
    const endIndex = sub.search(markRegex);
    if (endIndex >= 0) {
      logger.trace(`end of tag ${mark} found at :${position + endIndex + 2 * markLength}`);
      const inner = extract(
        combined,
        position + markLength,
        position + markLength + endIndex,
        tag,
        mark,
      );
      logger.trace(`Extrated data`, inner);
      const parsed = parseMinor(inner);
      // count marks
      parsed.root.consumed += markLength * 2;
      logger.trace(`Consumed: ${parsed.root.consumed}`);
      return parsed;
    }
  }
  return false;
}

function parseMinor(minor: Combined): DomTree {
  const children: NodeWithPosition[] = [];
  const all: NodeWithPosition[] = [];

  const { boldRegex, italicRegex, strikethroughRegex, underlineRegex } = getRegexes();

  logger.trace(`ParseMinor(${minor.tag}): >${minor.data}<`);
  if (minor.tag === 'P' && minor.data?.length == 0) {
    // Empty P => <p><br /><p>
    const p = document.createElement('P');
    const br = document.createElement('BR');
    p.append(br);

    const node = {
      node: p,
      rawPosition: minor.offset[0]!,
      consumed: 0,
      combined: minor,
    };

    return {
      root: node,
      all: [
        node,
        {
          node: br,
          rawPosition: minor.offset[0]!,
          consumed: 0,
          combined: minor,
        },
      ],
    };
  }

  if (minor.tag === 'PRE') {
    // do not parse pre tags content
    const pre = document.createElement(minor.tag);

    Object.entries(minor.attributes).forEach(([attr, value]) => {
      pre.setAttribute(attr, value);
    });

    const textNode = document.createTextNode(minor.data!);
    pre.append(textNode);
    const node = {
      node: pre,
      rawPosition: minor.offset[0]! - minor.initialMark.length,
      consumed: minor.data!.length + 4, // data length + '\n```'
      combined: minor,
    };
    return {
      root: node,
      all: [
        node,
        {
          node: textNode,
          rawPosition: minor.offset[0]!,
          consumed: textNode.length,
          combined: minor,
        },
      ],
    };
  } else {
    let offset = 0;
    let nodeStart = 0;

    const createTextNode = () => {
      if (offset > nodeStart) {
        const textNode = document.createTextNode(minor.data!.substring(nodeStart, offset));
        logger.trace('Create Text node: ', nodeStart, offset, textNode.data);
        const n = {
          node: textNode,
          rawPosition: minor.offset[nodeStart]!,
          consumed: textNode.length,
          combined: minor,
        };
        children.push(n);
        all.push(n);
      }
    };

    if (minor.data != null) {
      for (offset = 0; offset < minor.data.length; offset++) {
        // try to parse a sub tag
        const tag =
          processTag(minor, offset, '**', boldRegex, 'STRONG') ||
          processTag(minor, offset, '/', italicRegex, 'EM') ||
          processTag(minor, offset, '_', underlineRegex, 'U') ||
          processTag(minor, offset, '~', strikethroughRegex, 'STRIKE');

        if (tag != false) {
          // subtag found and parsed
          createTextNode();
          logger.trace(`Tagged "${tag.root.node.textContent}"`);
          children.push(tag.root);
          logger.trace('SubTag.all: ', tag.all);
          all.push(...tag.all);

          // move cursor to last character of tag
          offset += tag.root.consumed - 1;
          nodeStart = offset + 1;
        } else if (minor.data[offset] === '\n') {
          createTextNode();
          const br = document.createElement('BR');
          const n = {
            node: br,
            rawPosition: minor.offset[offset]!,
            consumed: 1,
            combined: minor,
          };
          children.push(n);
          all.push(n);
          offset++;
          nodeStart = offset;
        } else if (minor.data[offset] === '\\') {
          const escaped = minor.data[offset + 1];
          if (escaped) {
            createTextNode();
            const span = document.createElement('span');
            const n = {
              node: span,
              rawPosition: minor.offset[offset]!,
              consumed: 1,
              combined: minor,
            };
            children.push(n);
            all.push(n);
            offset++;
            nodeStart = offset;
          }
        }
      }

      createTextNode();
    }

    //
    const element = document.createElement(minor.tag);

    Object.entries(minor.attributes).forEach(([attr, value]) => {
      element.setAttribute(attr, value);
    });

    children.forEach(c => {
      element.appendChild(c.node);
    });
    const node = {
      node: element,
      rawPosition: minor.offset[0]! - minor.initialMark.length,
      consumed: minor.data!.length,
      combined: minor,
    };
    all.push(node);
    logger.trace('all: ', all);
    return { root: node, all: all };
  }
}

function rebuildHierarchy(domTrees: DomTree[]): DomTree[] {
  const domTreeWithList: DomTree[] = [];

  let currentListLevel: number = 0;
  let rootTree: DomTree | undefined = undefined;

  const listContext: (HTMLUListElement | HTMLOListElement)[] = [];

  domTrees.forEach(child => {
    if (child.root.combined.tag == 'LI') {
      const liMajor = child.root.combined.major as UListItem | OListItem;

      const itemLevel = liMajor.listLevel;

      if (currentListLevel === 0) {
        // no list context
        //const listType = liMajor.tagType === 'UListItem' ? 'UL' : 'OL';
        const listTag = document.createElement('UL') as HTMLUListElement | HTMLOListElement;
        listContext.push(listTag);
        rootTree = {
          root: {
            ...child.root,
            node: listTag,
          },
          all: [],
        };
        domTreeWithList.push(rootTree);
        currentListLevel = itemLevel;
      }

      rootTree!.all.push(...child.all);

      if (itemLevel > currentListLevel) {
        // const listType = liMajor.tagType === 'UListItem' ? 'UL' : 'OL';
        const listTag = document.createElement('UL') as HTMLUListElement | HTMLOListElement;

        const list = listContext[listContext.length - 1]!;
        (list.lastChild as Element).append(listTag);

        listContext.push(listTag);
        currentListLevel = itemLevel;
      } else if (itemLevel < currentListLevel) {
        listContext.pop();
        currentListLevel = itemLevel;
      }

      // append LI to current List
      const list = listContext[listContext.length - 1]!;
      list.append(child.root.node);
    } else {
      rootTree = undefined;
      listContext.length = 0;
      currentListLevel = 0;
      domTreeWithList.push(child);
    }
  });

  return domTreeWithList;
}

export interface NodesAndOffsets {
  nodes: Node[];
  offsets: Record<number, Node[]>;
}

function convertPosition(
  md: NodesAndOffsets,
  position: number | undefined,
): { node: Node; offset: number } | null {
  if (position) {
    const sortedOffset = Object.keys(md.offsets)
      .filter(offset => +offset <= position)
      .sort();
    const strOffset = sortedOffset[sortedOffset.length - 1];
    if (strOffset != null) {
      const theOffset = +strOffset;
      const nodes = md.offsets[theOffset];
      if (nodes != null && nodes.length > 0) {
        const text = nodes.find(n => n instanceof Text);
        if (text != null) {
          const delta = position - theOffset;
          const textLength = (text as Text).length;
          if (delta > textLength) {
            logger.warn('Range ');
            return {
              node: text,
              offset: textLength,
            };
          } else {
            return {
              node: text,
              offset: delta,
            };
          }
        } else {
          return {
            node: nodes[0]!,
            offset: 0,
          };
        }
      }
    }
  }
  return null;
}

export function convertRange(md: NodesAndOffsets, mdRange: MarkdownRange): Range {
  const range = document.createRange();

  const anchor = convertPosition(md, mdRange.anchor);
  if (anchor != null) {
    range.setStart(anchor.node, anchor.offset);
  }

  const focus = convertPosition(md, mdRange.focus);
  if (focus != null) {
    range.setEnd(focus.node, focus.offset);
  }

  return range;
}

export default function markdownToDom(markdown: string): NodesAndOffsets {
  logger.trace('MarkDown: ', markdown);
  if (markdown == ''){
    const p = document.createElement('P');
    const br = document.createElement('BR');
    p.append(br);

    return {
      nodes: [p],
      offsets: {0: [p]},
    };
  }

  const majorTags = extractMajorTags(markdown);
  const combined = majorTags.map(combineMultiline);
  consolidate(combined);
  const domTrees = combined.map(parseMinor);
  const domTreeWithHierarchy = rebuildHierarchy(domTrees);

  const result: NodesAndOffsets = {
    nodes: domTreeWithHierarchy.map(dt => dt.root.node),
    offsets: {},
  };
  domTreeWithHierarchy
    .flatMap(dt => dt.all)
    .sort((a, b) => {
      return a.rawPosition - b.rawPosition;
    })
    .forEach(c => {
      const list = result.offsets[c.rawPosition];
      if (list != null) {
        list.push(c.node);
      } else {
        result.offsets[c.rawPosition] = [c.node];
      }
    });

  return result;
}
