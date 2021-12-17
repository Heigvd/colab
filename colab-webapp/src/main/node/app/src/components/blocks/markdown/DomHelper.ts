/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { getLogger } from '../../../logger';

const logger = getLogger('DOMHelper');

interface CaretPosition {
  node: Node;
  offset: number;
}

interface OptionalCaretPosition {
  node: Node | undefined;
  offset: number;
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
const majorTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'UL', 'OL', 'LI', 'P', 'DIV'] as const;
const majorTagsSelector = majorTags.join(',');
type MajorTag = typeof majorTags[number];

function isMajorTag(tagName: string): tagName is MajorTag {
  return (majorTags as Readonly<string[]>).includes(tagName);
}

/*****************************************************
 * Find nodes
 *****************************************************/

/**
 * Find closest node matching tag, but never go upper the root
 */
export function boundedClosest(node: Node, tagName: string, root: Node) {
  let current = node instanceof Element ? node : node.parentElement;
  while (current != null) {
    if (current.tagName === tagName) {
      return current;
    }
    if (current === root || current.parentElement == null) {
      return null;
    }
    current = current.parentElement;
  }
}

export function sortNodes(c1: CaretPosition, c2: CaretPosition) {
  if (c1.node === c2.node) {
    if (c1.offset < c2.offset) {
      return { left: c1, right: c2 };
    } else {
      return { left: c2, right: c1 };
    }
  } else {
    const c1Leaf = moveToLeaf(c1, 'LEFT');
    const c2Leaf = moveToLeaf(c2, 'LEFT');
    const pos = c1Leaf.node.compareDocumentPosition(c2Leaf.node);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
      return { left: c1, right: c2 };
    } else {
      return { left: c2, right: c1 };
    }
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
function findNextNode(node: Node, rootNode: Node): Node | undefined {
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

function findNextLeaf(node: Node, rootNode: Node): Node | undefined {
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
      const ancestor = boundedClosest(start.node, tagName, rootNode);
      if (ancestor != null) {
        return { type: 'FULLY_WRAPPED', ancestor: ancestor };
      }
    } else if (start.node instanceof Element) {
      logger.warn('Is that case even exists ? (if so, may need to check children)');
      const ancestor = boundedClosest(start.node, tagName, rootNode);
      if (ancestor != null) {
        return { type: 'FULLY_WRAPPED', ancestor: ancestor };
      }
    }
    return { type: 'NO' };
  } else {
    const leftElem = start.node instanceof Element ? start.node : start.node.parentElement!;
    const rightElem = end.node instanceof Element ? end.node : end.node.parentElement!;
    const leftUpperTag = boundedClosest(leftElem, tagName, rootNode);

    if (leftUpperTag != null && leftUpperTag === boundedClosest(rightElem, tagName, rootNode)) {
      // both end wrapped within the same tag
      return { type: 'FULLY_WRAPPED', ancestor: leftUpperTag };
    } else {
      // need to check all leaves between start and end points
      logger.info('Check All leaves');
      let current: Node | undefined = start.node;
      const nodes: Element[] = [];
      while (current != null) {
        logger.info('Test leaf: ', current);
        const matchingParent = boundedClosest(current, tagName, rootNode);
        if (matchingParent != null) {
          nodes.push(matchingParent);
          // The current node is fine, move to next
          if (current === end.node) {
            current = undefined;
          } else {
            current = findNextLeaf(matchingParent, rootNode);
          }
        } else {
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
) {
  // Make sure carets stands in leaves
  const start = moveToLeaf(startCaret, 'LEFT');
  const end = moveToLeaf(endCaret, 'RIGHT');

  const state = areAllLeafsWrappedByTag(start, end, tagName, rootNode);
  if (state.type === 'NO') {
    logger.info(`At least one leaf not in ${tagName} tag`);
    spreadTag(start, end, tagName, rootNode);
  } else if (state.type === 'FULLY_WRAPPED') {
    //
    logger.info(`Fully Wrapped in one single ${tagName} tag`);
    safeUnwrap(state.ancestor, tagName, start, end, rootNode);
  } else if (state.type === 'FULLY_NESTED') {
    // the whole selection (at least all the Text nodes of the selection) is already in one or many
    // tags => remove tags
    //removeTags())
    logger.info(`Each leaf is wrapped in ${tagName} tag`);
    state.elements.forEach(elem => {
      safeUnwrap(elem, tagName, start, end, rootNode);
    });
  }
}

function spreadTag(start: CaretPosition, end: CaretPosition, tagName: MinorTag, rootNode: Node) {
  if (start.node === end.node) {
    if (start.offset === end.offset) {
      // start equals ends => nothing to do
      return;
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
    } else {
      logger.warn('Is that case even exists ?');
    }
  } else {
    let currentPosition: OptionalCaretPosition = start;

    while (currentPosition.node != null && currentPosition.node.contains(end.node) == false) {
      const nextPosition = { node: findNextNode(currentPosition.node, rootNode), offset: 0 };
      if (currentPosition.node instanceof Text) {
        if (currentPosition.offset < currentPosition.node.length) {
          const tag = document.createElement(tagName);
          const textNode = currentPosition.node.splitText(currentPosition.offset);
          const parent = currentPosition.node.parentNode!;
          parent.insertBefore(tag, textNode);
          tag.appendChild(textNode);
        }
      } else if (currentPosition.node instanceof Element) {
        insertTag(currentPosition.node, tagName);
      }
      currentPosition = nextPosition;
    }

    const top = currentPosition.node;
    if (top != null) {
      let rightPosition: { node: Node | undefined; offset: number } = end;
      while (rightPosition.node != null) {
        const previousPosition = { node: findPreviousNode(rightPosition.node, top), offset: 0 };
        if (rightPosition.node instanceof Text) {
          if (rightPosition.offset > 0) {
            const tag = document.createElement(tagName);
            rightPosition.node.splitText(rightPosition.offset);
            const parent = rightPosition.node.parentNode!;
            parent.insertBefore(tag, rightPosition.node);
            tag.appendChild(rightPosition.node);
          }
        } else if (rightPosition.node instanceof Element) {
          insertTag(rightPosition.node, tagName);
        }
        rightPosition = previousPosition;
      }
    } else {
      logger.warn('No top => BUG');
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
function wrap(node: Node, tagName: MinorTag) {
  const tag = document.createElement(tagName);
  node.parentNode!.insertBefore(tag, node);
  tag.appendChild(node);
}

function unwrap(node: Node) {
  const parent = node.parentNode;
  if (parent != null) {
    // Convert to array to
    Array.from(node.childNodes).forEach(child => {
      logger.info('Child to move up', child);
      parent.insertBefore(child, node);
    });
    parent.removeChild(node);
    parent.normalize();
  }
}

function safeUnwrap(
  node: Element,
  tagName: MinorTag,
  leftArg: Readonly<CaretPosition>,
  rightArg: Readonly<CaretPosition>,
  rootNode: Node,
) {
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

  if (saveLeftBranch) {
    // wrapStart -> start : TAG
    spreadTag(wrapStart, left, tagName, rootNode);
  }
  if (saveRightBranch) {
    // end -> endStart : TAG
    spreadTag(right, wrapEnd, tagName, rootNode);
  }

  // remove the wrapper too
  unwrap(node);
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

function insertTag(node: Element, tagName: MinorTag) {
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
}
