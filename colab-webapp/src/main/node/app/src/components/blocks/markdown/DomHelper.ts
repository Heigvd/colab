/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { getLogger } from '../../../logger';
import { HeadingLevel } from './parser/markdownToDom';

const logger = getLogger('DOMHelper');

interface CaretPosition {
  node: Node;
  offset: number;
}

interface OptionalCaretPosition {
  node: Node | undefined;
  offset: number;
}

interface CaretRange {
  start: CaretPosition;
  end: CaretPosition;
}

/**
 * Aka style tags
 */
const minorTags = ['STRONG', 'EM', 'STRIKE', 'U'] as const;
//const minorTagSelector = minorTags.join(",");
export type MinorTag = typeof minorTags[number];

/**
 * Structure tags
 */
const headingTags = ['H1', 'H2', 'H3', 'H4', 'H5'] as const;
export type HeadingTag = typeof headingTags[number];

export const majorTags = [...headingTags, 'LI', 'P', 'DIV', 'PRE'] as const;

const majorTagsSelector = majorTags.join(',');
export type MajorTag = typeof majorTags[number];

function isMajorTag(tagName: string): tagName is MajorTag {
  return (majorTags as Readonly<string[]>).includes(tagName);
}

export function getHeadingLevel(tag: MajorTag | null | undefined): HeadingLevel | 0 {
  if (tag?.startsWith('H')) {
    return tag.charAt(1) as unknown as HeadingLevel;
  } else {
    return 0;
  }
}

/*****************************************************
 * Find nodes
 *****************************************************/

/**
 * Find closest node matching tag, but never go upper the root
 */
export function boundedClosest(node: Node, tagName: Readonly<string[]>, root: Node) {
  let current = node instanceof Element ? node : node.parentElement;
  while (current != null) {
    if (tagName.includes(current.tagName)) {
      return current;
    }
    if (current === root || current.parentElement == null) {
      return null;
    }
    current = current.parentElement;
  }
}

function compareCaretPosition(a: CaretPosition, b: CaretPosition) {
  if (a.node === b.node) {
    if (a.offset === b.offset) {
      return 0;
    } else if (a.offset < b.offset) {
      return -1;
    } else {
      return 1;
    }
  } else {
    const c1Leaf = moveToLeaf(a, 'LEFT');
    const c2Leaf = moveToLeaf(b, 'LEFT');
    const pos = c1Leaf.node.compareDocumentPosition(c2Leaf.node);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    } else {
      return +1;
    }
  }
}

export function sortNodes(c1: CaretPosition, c2: CaretPosition) {
  const r = compareCaretPosition(c1, c2);
  if (r <= 0) {
    return { left: c1, right: c2 };
  } else {
    return { left: c2, right: c1 };
  }
}

function findFirstLeaf(node: Node): CaretPosition {
  let current = node;
  while (current != null) {
    if (current.firstChild == null) {
      return { node: current, offset: 0 };
    } else {
      current = current.firstChild;
    }
  }
  return {
    node: node,
    offset: 0,
  };
}

function findLastLeaf(node: Node): CaretPosition {
  let current = node;
  while (current != null) {
    if (current.lastChild == null) {
      if (current instanceof Text) {
        return { node: current, offset: current.length };
      } else {
        return { node: current, offset: 0 };
      }
    } else {
      current = current.lastChild;
    }
  }
  return {
    node: node,
    offset: 0,
  };
}

export function moveToLeaf(pos: CaretPosition, direction: 'LEFT' | 'RIGHT'): CaretPosition {
  if (pos.node instanceof Text) {
    return pos;
  } else if (pos.node instanceof Element) {
    if (pos.node.childNodes.length > 0) {
      if (direction === 'LEFT') {
        if (pos.offset > 0) {
          // normal case: move to end of left branch
          const child = pos.node.childNodes[pos.offset - 1]!;
          return findLastLeaf(child);
        } else {
          // Edge-case
          // move to start of right branch
          const child = pos.node.childNodes[pos.offset]!;
          return findFirstLeaf(child);
        }
      } else {
        if (pos.offset < pos.node.childNodes.length) {
          // normal case: move to start of right branch
          const child = pos.node.childNodes[pos.offset]!;
          return findFirstLeaf(child);
        } else {
          // Edge-case
          // move to end of last branch
          const child = pos.node.lastChild!;
          return findLastLeaf(child);
        }
      }
    } else {
      // Element has no children
      return pos;
    }
  } else {
    return pos;
  }
}

function startOfNode(pos: CaretPosition): boolean {
  return pos.offset === 0;
}

function endOfNode(pos: CaretPosition): boolean {
  if (pos.node instanceof Text) {
    return pos.offset === pos.node.length;
  } else if (pos.node instanceof Element) {
    return pos.offset === pos.node.childNodes.length;
  } else {
    return false;
  }
}

/**
 * Same as findNextNode, but moving left
 */
function findPreviousNode(node: Node, rootNode: Node): Node | undefined {
  if (node === rootNode) {
    return undefined;
  }
  const previousSiebling = node.previousSibling;
  if (previousSiebling != null) {
    return previousSiebling;
  } else {
    if (node.parentElement !== rootNode) {
      return findPreviousNode(node.parentElement!, rootNode);
    } else {
      return undefined;
    }
  }
}

function findPreviousLeaf(node: Node, rootNode: Node): Node | undefined {
  const previous = findPreviousNode(node, rootNode);
  return previous != null ? findLastLeaf(previous).node : undefined;
}

/*
 * See beautifoul examples: (N) => R
 *
 *      _
 *     / \
 *    N   R
 *
 *         _
 *        / \
 *       /   \
 *      |     \
 *     / \     |
 *    x   N   / \
 *           R   \
 *                x
 *
 */
export function findNextNode(node: Node, rootNode: Node): Node | undefined {
  if (node === rootNode) {
    return undefined;
  }
  const nextSiebling = node.nextSibling;
  if (nextSiebling != null) {
    return nextSiebling;
  } else {
    if (node.parentElement !== rootNode) {
      return findNextNode(node.parentElement!, rootNode);
    } else {
      return undefined;
    }
  }
}

export function findNextLeaf(node: Node, rootNode: Node): Node | undefined {
  const next = findNextNode(node, rootNode);
  return next != null ? findFirstLeaf(next).node : undefined;
}

/**
 * If given position match the end of a node, move to start of next leaf
 */
function moveToStartOfNextLeafIfAtEndOfNode(
  position: CaretPosition,
  rootNode: Node,
): CaretPosition {
  if (endOfNode(position)) {
    const nextLeaf = findNextLeaf(position.node, rootNode);
    if (nextLeaf) {
      return {
        node: nextLeaf,
        offset: 0,
      };
    }
  }
  return position;
}

/**
 * If given position match the end of a node, move to start of next leaf
 */
function moveToEndOfPreviousLeafIfAtStartNode(
  position: CaretPosition,
  rootNode: Node,
): CaretPosition {
  if (startOfNode(position)) {
    const previousLeaf = findPreviousLeaf(position.node, rootNode);
    if (previousLeaf) {
      if (previousLeaf instanceof Text) {
        return {
          node: previousLeaf,
          offset: previousLeaf.length,
        };
      } else {
        return {
          node: previousLeaf,
          offset: 0,
        };
      }
    }
  }
  return position;
}

/**
 * <pre>
 * FULLY WRAPPED: a single [TAG] wrap the whole selection
 *     [TAG_NAME]
 *        / \
 *       /   \
 *      X     \
 *     / \     X
 *  START X   / \
 *           X   \
 *                X
 *               / \
 *              END X
 *
 * FULLY NESTED: each leaf of the selection is wrapped by a matching tag. EG:
 *         X
 *        / \
 *       /   \
 *    [TAG]   \
 *     / \     XYZ
 *  START X    /  \
 *           [TAG] \
 *                 [TAG]
 *                  / \
 *                 END X
 *
 * NO: at least on leaf is not wrapped by a TAG (eg. Z):
 *         X
 *        / \
 *       /   \
 *    [TAG]   \
 *     / \     XYZ
 *  START X    /  \
 *            Z    \
 *                 [TAG]
 *                  / \
 *                END  X
 * </pre>
 */
export function areAllLeafsWrappedByTag(
  startCaret: CaretPosition,
  endCaret: CaretPosition,
  tagName: MinorTag,
  rootNode: Node,
):
  | { type: 'NO' }
  | {
      type: 'FULLY_WRAPPED';
      ancestor: Element;
    }
  | {
      type: 'FULLY_NESTED';
      elements: Element[];
    } {
  const start = moveToStartOfNextLeafIfAtEndOfNode(startCaret, rootNode);
  const end = moveToEndOfPreviousLeafIfAtStartNode(endCaret, rootNode);

  if (start.node == end.node) {
    if (start.node instanceof Text) {
      const ancestor = boundedClosest(start.node, [tagName], rootNode);
      if (ancestor != null) {
        return { type: 'FULLY_WRAPPED', ancestor: ancestor };
      }
    } else if (start.node instanceof Element) {
      logger.warn('Is that case even exists ? (if so, may need to check children)');
      const ancestor = boundedClosest(start.node, [tagName], rootNode);
      if (ancestor != null) {
        return { type: 'FULLY_WRAPPED', ancestor: ancestor };
      }
    }
    return { type: 'NO' };
  } else {
    const leftElem = start.node instanceof Element ? start.node : start.node.parentElement!;
    const rightElem = end.node instanceof Element ? end.node : end.node.parentElement!;
    const leftUpperTag = boundedClosest(leftElem, [tagName], rootNode);

    if (leftUpperTag != null && leftUpperTag === boundedClosest(rightElem, [tagName], rootNode)) {
      // both end wrapped within the same tag
      return { type: 'FULLY_WRAPPED', ancestor: leftUpperTag };
    } else {
      // need to check all leaves between start and end points
      logger.info('Check All leaves');
      let current: Node | undefined = start.node;
      const nodes: Element[] = [];
      while (current != null) {
        logger.info('Test leaf: ', current);

        const matchingParent = boundedClosest(current, [tagName], rootNode);
        if (matchingParent != null) {
          nodes.push(matchingParent);
          // The current node is fine, move to next
          if (current === end.node) {
            current = undefined;
          } else {
            current = findNextLeaf(matchingParent, rootNode);
          }
        } else if (current.textContent) {
          // current leaf not inside expected tag
          return { type: 'NO' };
        }
      }
      // all leaves stands in expected tags
      return { type: 'FULLY_NESTED', elements: nodes };
    }
  }
  return { type: 'NO' };
}

/*********************************************************************************************
 * MANIPULATION
 *********************************************************************************************/

export function toggleTag(
  startCaret: CaretPosition,
  endCaret: CaretPosition,
  tagName: MinorTag,
  rootNode: Node,
): CaretRange {
  // Make sure carets stands in leaves
  const start = moveToLeaf(startCaret, 'LEFT');
  const end = moveToLeaf(endCaret, 'RIGHT');

  const state = areAllLeafsWrappedByTag(start, end, tagName, rootNode);
  if (state.type === 'NO') {
    logger.info(`At least one leaf not in ${tagName} tag`);
    const range = spreadTag(start, end, tagName, rootNode);
    return range;
  } else if (state.type === 'FULLY_WRAPPED') {
    //
    logger.info(`Fully Wrapped in one single ${tagName} tag`);
    const range = safeUnwrap(state.ancestor, tagName, start, end, rootNode);
    return range;
  } else if (state.type === 'FULLY_NESTED') {
    // the whole selection (at least all the Text nodes of the selection) is already in one or many
    // tags => remove tags
    //removeTags())
    logger.info(`Each leaf is wrapped in ${tagName} tag`);
    const ranges = state.elements.map(elem => safeUnwrap(elem, tagName, start, end, rootNode));
    if (ranges.length > 0) {
      return {
        start: ranges[0]!.start,
        end: ranges[ranges.length - 1]!.end,
      };
    } else {
      throw new Error('unreachable code');
    }
  }
  throw new Error('unreachable code');
}

function spreadTag(
  start: CaretPosition,
  end: CaretPosition,
  tagName: MinorTag,
  rootNode: Node,
): CaretRange {
  if (start.node === end.node) {
    if (start.offset === end.offset) {
      // start equals ends => nothing to do
      return { start, end };
    }
    if (start.node instanceof Text) {
      if (end.offset < start.node.length) {
        // split only if endOffset is before end of node
        start.node.splitText(end.offset);
      }
      // split only if start offset not at start of node
      const toWrap = start.offset > 0 ? start.node.splitText(start.offset) : start.node;
      const tag = document.createElement(tagName);
      const parent = start.node.parentElement!;
      parent.insertBefore(tag, toWrap);
      tag.appendChild(toWrap);
      logger.info('Single text node');
      return {
        start: { node: toWrap, offset: 0 },
        end: { node: toWrap, offset: toWrap.length },
      };
    } else {
      logger.warn('Is that case even exists ?');
      return { start, end };
    }
  } else {
    let currentPosition: OptionalCaretPosition = start;
    const result: Partial<CaretRange> = {};

    const setStartResult = (node: Node, offset: number, force: boolean) => {
      if (force || result.start == null) {
        result.start = {
          node: node,
          offset: offset,
        };
      }
    };

    const setEndResult = (node: Node, offset: number, force: boolean) => {
      if (force || result.end == null) {
        result.end = {
          node: node,
          offset: offset,
        };
      }
    };

    while (currentPosition.node != null && currentPosition.node.contains(end.node) == false) {
      const nextPosition = { node: findNextNode(currentPosition.node, rootNode), offset: 0 };
      if (boundedClosest(currentPosition.node, [tagName], rootNode) != null) {
        // node already wrapped by tag
        setStartResult(currentPosition.node, currentPosition.offset, false);
      } else {
        if (currentPosition.node instanceof Text) {
          if (currentPosition.offset < currentPosition.node.length) {
            const tag = document.createElement(tagName);
            const textNode =
              currentPosition.offset > 0
                ? currentPosition.node.splitText(currentPosition.offset)
                : currentPosition.node;
            const parent = currentPosition.node.parentNode!;
            parent.insertBefore(tag, textNode);
            tag.appendChild(textNode);

            setStartResult(textNode, 0, false);
            setEndResult(textNode, textNode.length, true);
          }
        } else if (currentPosition.node instanceof Element) {
          const inserted = insertTag(currentPosition.node, tagName);

          setStartResult(inserted.start.node, inserted.start.offset, false);
          setEndResult(inserted.end.node, inserted.end.offset, true);
        }
      }
      currentPosition = nextPosition;
    }

    const forceStartResult = result.start == null;
    let forceEndResult = result.end != null;

    const top = currentPosition.node;
    if (top != null) {
      let rightPosition: { node: Node | undefined; offset: number } = end;
      while (rightPosition.node != null) {
        const previousPosition = { node: findPreviousNode(rightPosition.node, top), offset: 0 };
        if (boundedClosest(rightPosition.node, [tagName], rootNode) != null) {
          // already wrapped by tag
          setStartResult(rightPosition.node, 0, forceStartResult);
          setEndResult(rightPosition.node, rightPosition.offset, forceEndResult);
          forceEndResult = false;
        } else {
          if (previousPosition.node instanceof Text) {
            previousPosition.offset = previousPosition.node.length;
          }
          if (rightPosition.node instanceof Text) {
            if (rightPosition.offset > 0) {
              const tag = document.createElement(tagName);
              rightPosition.node.splitText(rightPosition.offset);
              const parent = rightPosition.node.parentNode!;
              parent.insertBefore(tag, rightPosition.node);
              tag.appendChild(rightPosition.node);

              setStartResult(rightPosition.node, rightPosition.offset, forceStartResult);
              setEndResult(rightPosition.node, rightPosition.node.length, forceEndResult);
              forceEndResult = false;
            }
          } else if (rightPosition.node instanceof Element) {
            const inserted = insertTag(rightPosition.node, tagName);
            setStartResult(inserted.start.node, inserted.start.offset, forceStartResult);
            setEndResult(inserted.end.node, inserted.end.offset, forceEndResult);
            forceEndResult = false;
          }
        }
        rightPosition = previousPosition;
      }
    } else {
      logger.warn('No top => BUG');
    }
    if (result.start && result.end) {
      return result as CaretRange;
    } else {
      throw new Error('Fail to spread tag');
    }
  }
}

/**
 * Wrap given node within brand new `tagName` tag
 *      _                           _
 *     / \                         / \
 *     x  \             \         x   \
 *        NODE       ====\            TAG
 *        /  \       ====/             |
 *       x    \         /             NODE
 *             x                     /  \
 *            / \                   x    \
 *           x   x                        x
 *                                       / \
 *                                      x   x
 *
 */
export function wrap(node: Node, tagName: string): Element {
  const tag = document.createElement(tagName);
  node.parentNode!.insertBefore(tag, node);
  tag.appendChild(node);
  return tag;
}

/**
 * Unwrap given node
 *      _                           _
 *     / \                         / \----
 *     x  \             \         x   \   \
 *        NODE       ====\             y   z
 *        /  \       ====/               / \
 *       y    \         /               /   \
 *             z                       a     b
 *            / \
 *           a   b
 *
 */
function unwrap(node: Node): CaretRange {
  const parent = node.parentNode;
  if (parent != null) {
    // Convert to array to
    const children = Array.from(node.childNodes).map(child => {
      logger.info('Child to move up', child);
      parent.insertBefore(child, node);
      return child;
    });
    parent.removeChild(node);

    // moving children broke the selection
    // restore it before normalization
    if (children.length > 0) {
      const last = findLastLeaf(children[children.length - 1]!);
      document.getSelection()?.setBaseAndExtent(children[0]!, 0, last.node, last.offset);
    }

    //parent.normalize();

    const selection = document.getSelection()!;
    return {
      start: { node: selection.anchorNode!, offset: selection.anchorOffset },
      end: { node: selection.focusNode!, offset: selection.focusOffset },
    };
  } else {
    throw new Error('Impossible case');
  }
}

function safeUnwrap(
  node: Element,
  tagName: MinorTag,
  leftArg: Readonly<CaretPosition>,
  rightArg: Readonly<CaretPosition>,
  rootNode: Node,
): CaretRange {
  const left = { ...leftArg };
  const right = { ...rightArg };

  // tag start before left caret position ?
  const saveLeftBranch = node.contains(left.node);
  // tag end after right caret position ?
  const saveRightBranch = node.contains(right.node);

  if (saveLeftBranch && left.node == right.node && left.node instanceof Text) {
    // Text node may be splitted in three part
    if (right.offset < left.node.length) {
      const newRight = left.node.splitText(right.offset);
      right.node = newRight;
      right.offset = 0;
    }
    if (left.offset > 0) {
      left.node.splitText(left.offset);
    }
  }

  const wrapStart = findFirstLeaf(node);
  const wrapEnd = findLastLeaf(node);
  // remove all tags within wrapper
  removeTags(node, tagName);

  // remove the wrapper too
  const result = unwrap(node);

  let start: CaretPosition | undefined = undefined;
  let end: CaretPosition | undefined = undefined;

  if (saveLeftBranch) {
    // wrapStart -> start : TAG
    const range = spreadTag(wrapStart, left, tagName, rootNode);
    if (compareCaretPosition(range.start, range.end) !== 0) {
      start = range.end;
    }
  }
  if (saveRightBranch) {
    // end -> endStart : TAG
    const range = spreadTag(right, wrapEnd, tagName, rootNode);
    if (compareCaretPosition(range.start, range.end) !== 0) {
      end = range.end;
    }
  }

  if (start == null) {
    start = result.start;
  }

  if (end == null) {
    end = result.end;
  }

  return {
    start: start!,
    end: end!,
  };
}

/**
 * Remove all matching tag in a given tree, but keep content
 */
function removeTags(node: Element, tagName: MinorTag) {
  const children = node.querySelectorAll(tagName);
  // remove all existing nodes matching the tag
  if (children.length > 0) {
    for (const child of children) {
      unwrap(child);
    }
  }
}

function insertTag(node: Element, tagName: MinorTag): CaretRange {
  removeTags(node, tagName);

  if (node.tagName != tagName) {
    const queue: Node[] = [];
    let current: Node | undefined = node;
    while (current != null) {
      if (current instanceof Element) {
        if (isMajorTag(current.tagName) || current.querySelector(majorTagsSelector) != null) {
          current.childNodes.forEach(n => queue.push(n));
        } else {
          wrap(current, tagName);
        }
      } else {
        wrap(current, tagName);
      }
      current = queue.pop();
    }
  }

  return {
    start: findFirstLeaf(node),
    end: findLastLeaf(node),
  };
}

export function switchTo(node: Element, tagName: MajorTag): Element {
  const newNode = wrap(node, tagName);
  unwrap(node);
  return newNode;
}

export function findChildByTag(element: Element, tag: string): Element | undefined {
  return Array.from(element.children).find(child => child.tagName === tag);
}

////////////////////
// List manipulation
////////////////////

/**
 * ul        ul
 *  li1      li1
 *  li2       ul
 *  li3        li2
 *           li3
 */
export function indentListItem(listItem: Element) {
  logger.trace('Indent');

  const parentUl = listItem.parentElement;
  if (parentUl == null) {
    throw new Error('Invalid DOM');
  }

  // First, make sure previous element exists
  const previous = listItem.previousSibling;
  if (previous instanceof Element == false || (previous as Element)?.tagName !== 'LI') {
    // Indenting first item does not make any sense
    return;
    // no previous LI, create one
    //previous = document.createElement("LI");
    //parentUl.insertBefore(previous, listItem);
  }

  // Then, make sure previous listItem contains a UL
  let subList = findChildByTag(previous as Element, 'UL');
  if (subList == null) {
    subList = document.createElement('UL');
    (previous as Element).appendChild(subList);
  }

  // Move listItem to tue subList
  subList.append(listItem);

  // If listItem, contains a list, move sublist up
  const selfSubList = findChildByTag(listItem, 'UL');
  if (selfSubList) {
    while (selfSubList.firstChild) {
      subList.append(selfSubList.firstChild);
    }
  }
}

export function unindentListItem(listItem: Element): boolean {
  logger.trace('deindent indentation');
  const currentUl = listItem.parentElement;

  if (currentUl == null) {
    throw new Error('Invalid DOM');
  }

  const parentListItem = currentUl.parentElement;
  if (parentListItem == null || parentListItem.tagName !== 'LI') {
    // cannont unindent first level
    return false;
  }

  const newUl = parentListItem.parentElement;
  if (newUl == null) {
    // cannont unindent first level
    return false;
  }

  const nextSubItems: ChildNode[] = [];
  while (listItem.nextSibling) {
    nextSubItems.push(listItem.nextSibling);
    listItem.nextSibling.remove();
  }

  parentListItem.after(listItem);

  if (nextSubItems.length > 0) {
    let subList = findChildByTag(listItem, 'UL');
    if (subList == null) {
      subList = document.createElement('UL');
      listItem.appendChild(subList);
    }
    while (nextSubItems.length > 0) {
      subList.append(nextSubItems.shift()!);
    }
  }

  if (currentUl.childNodes.length === 0) {
    currentUl.remove();
  }
  return true;
}
