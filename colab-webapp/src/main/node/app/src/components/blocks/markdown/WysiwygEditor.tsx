/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { uniq } from 'lodash';
import * as React from 'react';
import * as LiveHelper from '../../../LiveHelper';
import { getLogger } from '../../../logger';
import { usePresenceOnDocument } from '../../../selectors/presenceSelector';
import OpenGraphLink from '../../common/element/OpenGraphLink';
import DropDownMenu, { Entry } from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { DocEditorCtx } from '../../documents/DocumentEditorToolbox';
import { createCaret, getUserColor } from '../../projects/presence/Presence';
import { PresenceContext } from '../../projects/presence/PresenceContext';
import { lightIconButtonStyle, space_sm } from '../../styling/style';
import {
  areAllLeafsWrappedByTag,
  boundedClosest,
  findChildByTag,
  findNextLeaf,
  indentListItem,
  MajorTag,
  majorTags,
  MinorTag,
  moveToLeaf,
  sortNodes,
  switchTo,
  toggleTag,
  unindentListItem,
} from './DomHelper';
import {
  colabFlavouredMarkdown,
  colabFlavouredMarkdownEditable,
  computeOverlayPosition,
  LinkOverlay,
} from './MarkdownViewer';
import domToMarkdown, {
  escapeText,
  MarkdownRange,
  MarkdownWithSelection,
} from './parser/domToMarkdown';
import markdownToDom, {
  convertRange,
  getFirstMajorTag,
  MajorTagParsed,
  NodesAndOffsets,
} from './parser/markdownToDom';

const logger = getLogger('WysiwygEditor');

//logger.setLevel(5);

//////////////////////////////////////////////////////////////////////////////////////
// Selection manipulation
//////////////////////////////////////////////////////////////////////////////////////

type SavedSelection = Required<
  Pick<Selection, 'type' | 'anchorNode' | 'anchorOffset' | 'focusNode' | 'focusOffset'>
>;

export function selectionsEqual(a: SavedSelection, b: SavedSelection): boolean {
  if (a == null && b == null) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  if (a.anchorNode != b.anchorNode) {
    return false;
  }
  if (a.anchorOffset != b.anchorOffset) {
    return false;
  }
  if (a.focusNode != b.focusNode) {
    return false;
  }
  if (a.focusOffset != b.focusOffset) {
    return false;
  }

  return true;
}

function saveSelection(root: Element | null): SavedSelection | undefined {
  if (root != null) {
    const selection = document.getSelection();
    if (selection != null) {
      if (selection?.anchorNode != null && root) {
        if (root.contains(selection.anchorNode)) {
          return {
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode,
            focusOffset: selection.focusOffset,
            type: selection.type,
          };
        }
      }
    }
    return undefined;
  }
}

function restoreSavedSelection(savedSelection: SavedSelection): Selection | null {
  const selection = document.getSelection();

  // restore saved selection
  if (savedSelection.focusNode) {
    selection?.setBaseAndExtent(
      savedSelection.anchorNode!,
      savedSelection.anchorOffset,
      savedSelection.focusNode,
      savedSelection.focusOffset,
    );
  } else {
    selection?.setPosition(savedSelection.anchorNode, savedSelection.anchorOffset);
  }
  return selection;
}

function getSelectionType(root: Element | null): 'RANGE' | 'ON_WORD' | 'NOT_ON_WORD' | 'NONE' {
  const userSelection = saveSelection(root);
  if (userSelection) {
    if (userSelection.type === 'Range') {
      // Range is a Range
      return 'RANGE';
    } else if (userSelection.type === 'Caret') {
      // two possibilities.
      // is the caret within a world or outside

      const wSelection = window.getSelection() as SelectionWithModify;

      (wSelection as SelectionWithModify).modify('extend', 'backward', 'character');
      const bText = wSelection.getRangeAt(0).toString();
      restoreSavedSelection(userSelection);

      (wSelection as SelectionWithModify).modify('extend', 'forward', 'character');
      const fText = wSelection.getRangeAt(0).toString();
      restoreSavedSelection(userSelection);

      logger.info('Selection Texts: ', bText, fText);
      if (bText.trim() && fText.trim()) {
        return 'ON_WORD';
      }

      return 'NOT_ON_WORD';
    }
  }
  return 'NONE';
}

//////////////////////////////////////////////////////////////////////////////////////

function restoreMarkdownRange(dom: NodesAndOffsets, range: MarkdownWithSelection['range']) {
  const domRange = convertRange(dom, range);
  if (domRange) {
    const selection = window.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
      selection.addRange(domRange);
    }
  }
}

function getLastIndexOfMatch(str: string, regex: RegExp): number {
  regex.lastIndex = 0;
  let index = -1;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(str)) != null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    index = match.index;
  }
  return index;
}

/**
 * Insert to insert in md, according to cursor position set in md.range
 */
function mergeMardown(md: MarkdownWithSelection, toInsert: string): MarkdownWithSelection {
  const anchor = md.range.anchor ?? md.data.length;
  const focus = md.range.focus ?? anchor ?? md.data.length;

  const start = Math.min(anchor, focus);
  const end = Math.max(anchor, focus);

  logger.info('Range: ', { start, end });

  const result: MarkdownWithSelection = {
    data: '',
    range: {
      anchor: start,
      focus: end,
    },
  };
  if (end > start) {
    // Selection
    result.range.focus = start + toInsert.length;
  } else {
    // cursor
    result.range.anchor = start + toInsert.length;
  }

  let firstMajor: MajorTagParsed | undefined;

  if (start ?? 0 > 0) {
    // extract text from 0 to selection start
    const sub = md.data.substring(0, start);
    // find last line return (not follwowed by a space) within such extract
    const index = getLastIndexOfMatch(sub, /\n(?! )/g);
    // extract markdown from this position
    const part = md.data.substring(index + 1);
    firstMajor = getFirstMajorTag(part);
  } else {
    firstMajor = getFirstMajorTag(md.data);
  }

  const toInsertMajor = getFirstMajorTag(toInsert);
  logger.info('FirstMajor: ', firstMajor);
  logger.info('ToInsertMaj: ', toInsertMajor);

  if (toInsertMajor) {
    if (firstMajor) {
      if (firstMajor.tagType === toInsertMajor.tagType || toInsertMajor.tagType === 'P') {
        logger.info('SameTag Merge');
        result.data =
          md.data.substring(0, start) +
          toInsert.substring(toInsertMajor.initialMark.length) +
          md.data.substring(end);
      } else {
        logger.info('Insert ', toInsertMajor.tagType, ' after ', firstMajor.tagType);
        result.data = md.data.substring(0, start) + '\n' + toInsert + '\n' + md.data.substring(end);
      }
    } else {
      result.data = toInsert;
    }
  }

  return result;
}

/*************************************************
 *    STYLES
 *************************************************/

export const idleStyle = cx(
  lightIconButtonStyle,
  css({
    padding: '5px',
    margin: '0 2px',
    '&:hover': {
      cursor: 'pointer',
    },
  }),
);

export const toggledStyle = cx(
  idleStyle,
  css({
    backgroundColor: 'var(--divider-main)',
    color: 'var(--primary-main)',
  }),
);

export const toolbarSeparatorStyle = css({
  paddingLeft: space_sm,
  marginLeft: space_sm,
  borderLeft: '1px solid var(--divider-main)',
  height: '24px',
});

const editorStyle = cx(
  colabFlavouredMarkdown,
  colabFlavouredMarkdownEditable,
  css({
    backgroundColor: 'var(--bg-primary)',
    padding: '5px',
    border: '1px solid var(--divider-fade)',
    whiteSpace: 'pre-line',
    cursor: 'text',
    '& .some-cursor': {
      position: 'absolute',
      pointerEvents: 'none',
      userSelect: 'none',
    },
    '&:hover': {
      border: '1px solid var(--divider-main)',
    },
    ':focus, :focus-visible': {
      border: '1px solid var(--secondary-main)',
      outline: 'none',
    },
  }),
);

const positionOverlayStyle = css({
  pointerEvents: 'none',
});

/*************************************************
 *    TYPES
 *************************************************/

type ListType = 'UL' | 'OL' | 'TL' | 'none';

export interface ToolbarState {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  underline: boolean;
  list: ListType;
  majorStyle: MajorTag | undefined;
}

export interface ToolbarFeatures {
  toggleBold: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleItalic: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleUnderline: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleStrike: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleList: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleOrderedList: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleTodoList: (e: React.MouseEvent | React.KeyboardEvent) => void;
  selectMajorStyle: (tag: MajorTag) => void;
}

interface ToolbarButtonProps {
  toggled: boolean;
  onClick: (event: React.MouseEvent) => void;
  icon: string;
}

export interface TXTFormatToolbarProps {
  toolbarState: ToolbarState;
  toolbarFormatFeatures: ToolbarFeatures;
}

export interface WysiwygEditorProps {
  /** markdown text */
  value: string;
  /** new markdown text */
  onChange: (newValue: string) => void;
  className?: string;
  docToTouchId?: number;
  flyingToolBar?: boolean;
  //ToolBar?: React.FunctionComponent<TXTFormatToolbarProps>;
  ToolBar?: React.FunctionComponent<TXTFormatToolbarProps>;
  selected?: boolean;
}

type SelectionWithModify = Selection & {
  modify: (
    alter: 'move' | 'extend',
    direction: 'left' | 'right' | 'forward' | 'backward',
    granularity: 'word' | 'character',
  ) => void;
};

function getListType(element: Element | null | undefined): ListType {
  if (element == null) {
    return 'none';
  }

  if (element.tagName != 'LI') {
    return 'none';
  }
  if (element.getAttribute('data-checked')) {
    return 'TL';
  }

  const type = element.getAttribute('data-list-type');
  if (type === 'OL') {
    return 'OL';
  }

  return 'UL';
}

/*************************************************
 *    COMPONENTS
 *************************************************/

function ToolbarSeparator() {
  return <span className={toolbarSeparatorStyle} />;
}

function ToolbarButton({ toggled, onClick, icon }: ToolbarButtonProps) {
  return (
    <span
      className={cx('fa-layers', toggled ? toggledStyle : idleStyle)}
      onMouseDownCapture={onClick}
    >
       <Icon icon={icon} />
    </span>
  );
}

function getTagHumanName(tag: string | undefined): string {
  switch (tag) {
    case 'H1':
      return 'Title 1';
    case 'H2':
      return 'Title 2';
    case 'H3':
      return 'Title 3';
    case 'H4':
      return 'Title 4';
    case 'H5':
      return 'Title 5';
    case 'P':
    case 'DIV':
      return 'paragraph';
    case 'PRE':
      return 'code';
    default:
      return ' - ';
    //return tag?.toLowerCase() || '';
  }
}

function createEntry(tag: MajorTag | undefined, jsx: boolean) {
  const name = getTagHumanName(tag);
  const label = jsx ? React.createElement((tag || 'DIV').toLowerCase(), {}, name) : name;
  return { value: tag || 'DIV', label: <div className={css({ width: '80px' })}>{label}</div> };
}

export function TXTFormatToolbar({ toolbarState, toolbarFormatFeatures }: TXTFormatToolbarProps) {
  const selectHeadingCb = React.useCallback(
    (entry: Entry<MajorTag>) => {
      toolbarFormatFeatures.selectMajorStyle(entry.value);
    },
    [toolbarFormatFeatures],
  );

  return (
    <Flex>
      <DropDownMenu
        value={toolbarState.majorStyle}
        menuIcon="CARET"
        onSelect={selectHeadingCb}
        valueComp={createEntry(toolbarState.majorStyle, false)}
        entries={[
          createEntry('H1', true),
          createEntry('H2', true),
          createEntry('H3', true),
          createEntry('H4', true),
          createEntry('H5', true),
          createEntry('P', true),
          createEntry('PRE', true),
        ]}
      />
      <ToolbarSeparator />
      <ToolbarButton
        icon={'format_bold'}
        toggled={toolbarState.bold}
        onClick={toolbarFormatFeatures.toggleBold}
      />
      <ToolbarButton
        icon={'format_italic'}
        toggled={toolbarState.italic}
        onClick={toolbarFormatFeatures.toggleItalic}
      />
      <ToolbarButton
        icon={'format_underlined'}
        toggled={toolbarState.underline}
        onClick={toolbarFormatFeatures.toggleUnderline}
      />
      <ToolbarButton
        icon={'strikethrough_s'}
        toggled={toolbarState.strike}
        onClick={toolbarFormatFeatures.toggleStrike}
      />
      <ToolbarSeparator />
      <ToolbarButton
        icon={'format_list_bulleted'}
        toggled={toolbarState.list === 'UL'}
        onClick={toolbarFormatFeatures.toggleList}
      />
      <ToolbarButton
        icon={'format_list_numbered'}
        toggled={toolbarState.list === 'OL'}
        onClick={toolbarFormatFeatures.toggleOrderedList}
      />
      <ToolbarButton
        icon={'checklist'}
        toggled={toolbarState.list === 'TL'}
        onClick={toolbarFormatFeatures.toggleTodoList}
      />
      <ToolbarSeparator />
    </Flex>
  );
}

/* function HiddenToolbar({ toolbarState, toolbarFormatFeatures }: TXTFormatToolbarProps){
 const {setToolbar} = useContext(...)

const FlyingToolbar = React.useMemo(()=>{
  return function(){
    return <TXTFormatToolbar toolbarState={toolbarState} toolbarFormatFeatures={toolbarFormatFeatures}/>
  }
})

React.useEffect(()=>{
  setToolbar(FlyingToolbar);
  return ()=>setToolbar(undefined)
},[FlyingToolbar])

 return null;
} */

/**
 * Get new selection range by applying offsets to current selection
 */
export function computeSelectionOffsets(offsets: LiveHelper.Offsets, range: MarkdownRange) {
  const anchorIndex = range.anchor || 0;
  const focusIndex = range.focus || 0;

  const newRange = { ...range };
  logger.trace('Move selection ', anchorIndex, ':', focusIndex, ' according to offsets: ', offsets);

  for (const sKey in offsets) {
    const key = +sKey;
    const offset = offsets[key]!;
    if (newRange.anchor != null && key < anchorIndex) {
      newRange.anchor += offset;
    }
    if (newRange.focus != null && key < focusIndex) {
      newRange.focus += offset;
    }
  }

  logger.trace('New Range: ', newRange);
  return newRange;
}

/**
 * Wysiwyg editor which try to keep selected text accros updates
 */
export default function WysiwygEditor({
  value,
  onChange,
  className,
  docToTouchId,
  flyingToolBar,
  ToolBar = TXTFormatToolbar,
  selected,
}: WysiwygEditorProps): JSX.Element {
  // use a ref to manage editor content
  const divRef = React.useRef<HTMLDivElement>(null);

  const positionOverlayRef = React.useRef<HTMLDivElement>(null);

  // to detect is composition in on going
  const compositionRef = React.useRef(false);
  const { setEditToolbar } = React.useContext(DocEditorCtx);

  const selectionRef = React.useRef<SavedSelection | null>(null);

  const { touch } = React.useContext(PresenceContext);

  const touchCb = React.useMemo(() => {
    if (docToTouchId != null) {
      return (start: number, end: number) => {
        touch(current => {
          return {
            ...current,
            documentId: docToTouchId,
            selectionStart: start,
            selectionEnd: end,
          };
        });
      };
    } else {
      return undefined;
    }
  }, [touch, docToTouchId]);

  const domOffsetRef = React.useRef<NodesAndOffsets | undefined>(undefined);

  const presenceOnDoc = usePresenceOnDocument(docToTouchId);

  React.useEffect(() => {
    if (domOffsetRef.current && positionOverlayRef.current && divRef.current) {
      const divText = divRef.current;
      const textBound = divText.getBoundingClientRect();

      const divPos = positionOverlayRef.current;
      while (divPos.firstChild) {
        divPos.removeChild(divPos.firstChild);
      }

      presenceOnDoc.forEach(p => {
        if (p.selectionEnd != null && p.selectionStart != null) {
          const range = convertRange(domOffsetRef.current!, {
            anchor: p.selectionStart ?? undefined,
            focus: p.selectionEnd ?? undefined,
          });

          const rect = range.getBoundingClientRect();
          const left = rect.left - textBound.left;
          const top = rect.top - textBound.top;
          const color = getUserColor(p);

          if (p.selectionEnd === p.selectionStart) {
            // single caret
            divPos.append(createCaret(top, left, rect.height, color, 'down'));
          } else {
            const pDiv = document.createElement('DIV');

            pDiv.style.position = 'absolute';
            pDiv.style.top = `${top}px`;
            pDiv.style.left = `${left}px`;
            pDiv.style.width = `${rect.width}px`;
            pDiv.style.height = `${rect.height}px`;
            pDiv.style.backgroundColor = color;
            pDiv.style.opacity = '0.2';
            divPos.append(pDiv);

            const startLocation = new Range();
            startLocation.setStart(range.startContainer, range.startOffset);
            startLocation.setEnd(range.startContainer, range.startOffset);
            const startPos = startLocation.getBoundingClientRect();

            divPos.append(
              createCaret(
                startPos.top - textBound.top,
                startPos.left - textBound.left,
                startPos.height,
                color,
                'right',
              ),
            );

            const endLocation = new Range();
            endLocation.setStart(range.endContainer, range.endOffset);
            endLocation.setEnd(range.endContainer, range.endOffset);
            const endPos = endLocation.getBoundingClientRect();

            divPos.append(
              createCaret(
                endPos.top - textBound.top,
                endPos.left - textBound.left,
                endPos.height,
                color,
                'left',
              ),
            );
          }
        }
      });
    }
  }, [presenceOnDoc]);

  /**
   * Convert markdown to dom and put thre resulting tree in given dom.
   * Optionally, restore the selection to match the range in markdown, if any.
   */
  const putMarkdownInDom = React.useCallback(
    (div: HTMLDivElement, markdown: MarkdownWithSelection, restoreSelection: boolean) => {
      const hacked = markdown.data.replace(/ $/gm, '\u00A0');
      logger.info('Markdown:>', hacked, '<');
      const newDom = markdownToDom(hacked);

      logger.info('DOM:', newDom);

      // make sure div is empty
      while (div.firstChild != null) {
        div.removeChild(div.firstChild);
      }
      newDom.nodes.forEach(n => div.appendChild(n));

      if (restoreSelection) {
        restoreMarkdownRange(newDom, markdown.range);
      }
      domOffsetRef.current = newDom;
    },
    [],
  );

  const [toolbarState, setToolbarState] = React.useState<ToolbarState>({
    bold: false,
    italic: false,
    strike: false,
    underline: false,
    list: 'none',
    majorStyle: 'P',
  });

  React.useLayoutEffect(() => {
    // props just changed
    const div = divRef.current;
    if (div != null) {
      const md = domToMarkdown(divRef.current!);
      if (md.data !== value) {
        logger.info('Update value from outside');
        // current markdown version is different

        const newRange: MarkdownRange = {
          anchor: undefined,
          focus: undefined,
        };

        if (md.range.anchor != null || md.range.focus != null) {
          // -> should update selection caret/range
          const diff = LiveHelper.getMicroChange(md.data, value);
          const offsets = LiveHelper.computeOffsets(diff);
          const range = computeSelectionOffsets(offsets, md.range);
          newRange.anchor = range.anchor;
          newRange.focus = range.focus;
        }

        putMarkdownInDom(div, { data: value, range: newRange }, true);
      } else {
        logger.info('Do not update :same value');
        // sync dom to restore dom integrity
        putMarkdownInDom(div, { data: value, range: md.range }, true);
      }
    }
  }, [value, putMarkdownInDom]);

  const getAllSelectedMajorElements = React.useCallback(() => {
    const majorNodes: Element[] = [];
    const selection = document.getSelection();
    if (selection?.anchorNode != null && divRef.current) {
      if (divRef.current.contains(selection.anchorNode)) {
        if (selection.type === 'Caret') {
          if (
            selection.anchorNode instanceof Text &&
            selection.anchorNode.parentElement === divRef.current
          ) {
            // HACK: <div>TEXT</div> case => create <div><p>TEXT</p></div>
            const offset = selection.anchorOffset;
            const textNode = selection.anchorNode;

            const p = document.createElement('P');
            divRef.current.insertBefore(p, textNode);
            p.append(textNode);
            selection.setPosition(textNode, offset);
          }

          const current = boundedClosest(selection.anchorNode!, majorTags, divRef.current);
          if (current && current != divRef.current) {
            majorNodes.push(current);
          }
        } else {
          logger.info('Seleciton changed');

          const selection = document.getSelection();

          const nodes = sortNodes(
            { node: selection!.anchorNode!, offset: selection!.anchorOffset },
            { node: selection!.focusNode!, offset: selection!.focusOffset },
          );

          const finalMajor = boundedClosest(nodes.right.node, majorTags, divRef.current);

          let current: Node | undefined = nodes.left.node;
          let major: Element | null | undefined = undefined;

          logger.trace('Selection: ', nodes.left.node, nodes.right.node, finalMajor);
          do {
            logger.trace('Process ', current);
            major = boundedClosest(current, majorTags, divRef.current);

            logger.trace('Current Major ', major);
            if (major && major != divRef.current && majorNodes.includes(major) === false) {
              majorNodes.push(major);
            }
            current = findNextLeaf(current, divRef.current);
            logger.trace('NewCurrent ', current);
          } while (current != null && major !== finalMajor);
        }
      }
    }
    return majorNodes;
  }, []);

  const updateToolbar = React.useCallback(() => {
    const selection = selectionRef.current;
    if (selection != null) {
      if (divRef.current) {
        const majors = getAllSelectedMajorElements();
        if (selection.type === 'Caret') {
          const isBold = boundedClosest(selection.anchorNode!, ['STRONG'], divRef.current) != null;
          const isItalic = boundedClosest(selection.anchorNode!, ['EM'], divRef.current) != null;
          const isStrike =
            boundedClosest(selection.anchorNode!, ['STRIKE'], divRef.current) != null;
          const isUnderline = boundedClosest(selection.anchorNode!, ['U'], divRef.current) != null;

          const majorElement = boundedClosest(selection.anchorNode!, majorTags, divRef.current);

          setToolbarState({
            bold: isBold,
            italic: isItalic,
            strike: isStrike,
            underline: isUnderline,
            list: getListType(majorElement),
            majorStyle: majorElement?.tagName as MajorTag,
          });
        } else if (selection.type === 'Range') {
          const nodes = sortNodes(
            { node: selection.anchorNode!, offset: selection.anchorOffset },
            { node: selection.focusNode!, offset: selection.focusOffset },
          );
          // Make sure carets stands in leaves
          const start = moveToLeaf(nodes.left, 'LEFT');
          const end = moveToLeaf(nodes.right, 'RIGHT');

          const isBold = areAllLeafsWrappedByTag(start, end, 'STRONG', divRef.current).type != 'NO';
          const isItalic = areAllLeafsWrappedByTag(start, end, 'EM', divRef.current).type != 'NO';
          const isStrike =
            areAllLeafsWrappedByTag(start, end, 'STRIKE', divRef.current).type != 'NO';
          const isUnderline = areAllLeafsWrappedByTag(start, end, 'U', divRef.current).type != 'NO';

          const uniqMajors = uniq(majors.map(t => t.tagName));

          const uniqListType = uniq(majors.map(t => t.getAttribute('data-list-type')));
          const currentListType =
            uniqListType.length === 1 && uniqListType[0] != null ? uniqListType[0] : 'none';

          setToolbarState({
            bold: isBold,
            italic: isItalic,
            strike: isStrike,
            underline: isUnderline,
            list: currentListType as ListType,
            majorStyle: uniqMajors.length === 1 ? (uniqMajors[0] as MajorTag) : undefined,
          });
        }
      }
    }
  }, [getAllSelectedMajorElements]);

  const onSelectionChange = React.useCallback(() => {
    const selection = saveSelection(divRef.current);
    if (selection) {
      // since getSelection return a mutable object, make sure to make a copy
      selectionRef.current = selection;
      updateToolbar();
      if (touchCb) {
        const { range } = domToMarkdown(divRef.current);
        if (range.anchor != null && range.focus != null) {
          touchCb(Math.min(range.anchor, range.focus), Math.max(range.anchor, range.focus));
        }
      }

      if (selection.type === 'Caret' && selection.focusNode != null) {
        const node =
          selection.focusNode instanceof Element
            ? selection.focusNode
            : selection.focusNode.parentElement;
        if (node) {
          const linkNode = node.closest('span[data-type=link]');
          if (linkNode) {
            // tag found
            setLinkOverlay({
              node: linkNode,
              editing: false,
              href: linkNode.getAttribute('data-link-href') ?? '',
            });
          } else {
            // no link here
            setLinkOverlay(undefined);
          }
        } else {
          // no element here
          setLinkOverlay(undefined);
        }
      } else {
        // do never show link overlay if selection is a range
        setLinkOverlay(undefined);
      }

      //      logger.info("SelectionAnchor: ", selection.anchorNode?.nodeName);
      //      logger.info("SelectionAndhorOffset: ", selection.anchorOffset);
      //      logger.info("SelectionFocus: ", selection.focusNode?.nodeName);
      //      logger.info("SelectionFocusOffset: ", selection.focusOffset);

      //      if (caretRef.current != null) {
      //                const ghost = document.createElement("span");
      //        const range = document.createRange();
      //        range.setStart(selection.anchorNode!, selection.anchorOffset);
      //        const bounds = range.getBoundingClientRect();
      //        range.insertNode(ghost);
      //        const left = ghost.offsetLeft;
      //        const top = ghost.offsetTop;
      //        const style = window.getComputedStyle(ghost);
      //        caretRef.current.style.fontSize = style.fontSize;
      //        caretRef.current.style.fontWeight = style.fontWeight;
      //        caretRef.current.style.left = `${bounds.left}px`;
      //        caretRef.current.style.top = `${bounds.top}px`;
      //        ghost.remove();
      //      }
    }
  }, [updateToolbar, touchCb]);

  /* Register onSelectionChange event listener */
  React.useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [onSelectionChange]);

  /**
   * convert current DOM tree and trigger onChange
   */
  const onInternalChangeCb = React.useCallback(() => {
    updateToolbar();
    const md = domToMarkdown(divRef.current!);
    logger.info('OnInternalChangeCb', md.data);
    const unHacked = md.data.replace(/\u00A0$/gm, ' ');
    onChange(unHacked);
  }, [onChange, updateToolbar]);

  const onInputCb = React.useCallback(
    (e: React.FormEvent) => {
      if ('isComposing' in e.nativeEvent) {
        // Firefox and chrome expose isComposing in native inputEvent
        const tE = e.nativeEvent as unknown as { isComposing: boolean };
        if (tE.isComposing === false) {
          onInternalChangeCb();
        }
      } else {
        // Safari do not
        if (compositionRef.current === false) {
          onInternalChangeCb();
        }
      }
    },
    [onInternalChangeCb],
  );

  const logCompStart = React.useCallback(() => {
    compositionRef.current = true;
  }, []);

  const logCompEnd = React.useCallback(
    (e: React.CompositionEvent) => {
      compositionRef.current = false;
      if (e.data.length > 0) {
        onInternalChangeCb();
      }
    },
    [onInternalChangeCb],
  );

  const toggleMinorTagCb = React.useCallback(
    (tagName: MinorTag) => {
      const savedSelection = selectionRef.current;
      if (savedSelection?.anchorNode != null && divRef.current) {
        if (divRef.current.contains(savedSelection.anchorNode)) {
          const selection = restoreSavedSelection(savedSelection);

          let originalCaret: { node: Node; offset: number } | null = null;

          if (selection?.type === 'Caret') {
            const sType = getSelectionType(divRef.current);
            logger.trace('SelectionType: ', sType);
            if (sType === 'ON_WORD') {
              originalCaret = { node: selection.anchorNode!, offset: selection.anchorOffset };
              (selection as SelectionWithModify).modify('move', 'backward', 'word');
              (selection as SelectionWithModify).modify('extend', 'forward', 'word');
            }
          }

          if (selection?.type === 'Caret') {
            const toggled = !!boundedClosest(selection.anchorNode!, [tagName], divRef.current);
            if (toggled) {
              logger.trace('Untoggle');

              const node = document.createTextNode('x');
              selection.getRangeAt(0).insertNode(node);
              toggleTag(
                {
                  node,
                  offset: 0,
                },
                {
                  node: node,
                  offset: 1,
                },
                tagName,
                divRef.current,
              );
              node.textContent = '';
              selection.setPosition(node, 0);
            } else {
              logger.trace('Toggle');
              const newTag = document.createElement(tagName);
              selection.getRangeAt(0).insertNode(newTag);
              selection.setPosition(newTag);
            }
          } else {
            logger.info('Selection: ', savedSelection);
            const nodes = sortNodes(
              { node: selection!.anchorNode!, offset: selection!.anchorOffset },
              { node: selection!.focusNode!, offset: selection!.focusOffset },
            );
            if (originalCaret) {
              document.getSelection()?.setPosition(originalCaret.node, originalCaret.offset);
            }
            const range = toggleTag(nodes.left, nodes.right, tagName, divRef.current);
            if (originalCaret) {
              const sel = document.getSelection()! as SelectionWithModify;
              sel.setPosition(originalCaret.node, 0);
              for (let i = 0; i < originalCaret.offset; i++) {
                sel.modify('move', 'forward', 'character');
              }
            } else {
              document
                .getSelection()
                ?.setBaseAndExtent(
                  range.start.node,
                  range.start.offset,
                  range.end.node,
                  range.end.offset,
                );
              onInternalChangeCb();
            }
          }
        }
      }
    },
    [onInternalChangeCb],
  );

  /**
   * @param node must be a major tag!
   */
  const toggleListNode = React.useCallback(
    (node: Element, newType: 'UL' | 'OL' | 'TL' | 'none'): Element => {
      if (node.parentElement) {
        const currentListType = getListType(node);
        if (newType != null && currentListType === 'none') {
          // make list item
          let previous = node.previousSibling;
          if (previous instanceof Element == false || (previous as Element)?.tagName != 'UL') {
            // previous does not exist or is not a list
            // init list
            previous = document.createElement('UL');
            node.parentElement.insertBefore(previous, node);
          }
          const selection = document.getSelection();
          const isMajorSelected = selection?.anchorNode === node;

          const listItem = document.createElement('LI');
          listItem.setAttribute('data-list-type', newType);
          if (newType === 'TL') {
            listItem.setAttribute('data-checked', 'TODO');
          }
          while (node.firstChild) {
            listItem.append(node.firstChild);
          }
          previous!.appendChild(listItem);

          const next = node.nextElementSibling;
          if (next?.tagName === 'UL') {
            // merge consecutive list
            while (next.firstChild) {
              previous!.appendChild(next.firstChild);
            }
            next.remove();
          }
          node.remove();

          if (isMajorSelected) {
            selection?.setPosition(listItem, 0);
          }

          return listItem;
        } else if (currentListType !== 'none' && newType == 'none') {
          // unindent
          let unindent = true;
          while (unindent) {
            unindent = unindentListItem(node);
          }

          const nestedList = findChildByTag(node, 'UL');

          // collect next list items
          const nextLis: Element[] = [];
          while (node.nextElementSibling) {
            nextLis.push(node.nextElementSibling);
            node.nextElementSibling.remove();
          }

          let newList: Element | undefined = undefined;

          if (nestedList || nextLis.length > 0) {
            newList = document.createElement('UL');
            if (nestedList) {
              // move previously nested item to new list
              while (nestedList.firstChild) {
                newList.append(nestedList.firstChild);
              }
              nestedList.remove();
            }
            for (const item of nextLis) {
              newList.append(item);
            }
          }
          const newMajor = document.createElement('P');
          while (node.firstChild) {
            newMajor.append(node.firstChild);
          }
          node.parentElement.after(newMajor);
          if (newList) {
            newMajor.after(newList);
          }

          node.remove();
          return newMajor;
        } else {
          // mutate list
          node.removeAttribute('data-checked');
          node.setAttribute('data-list-type', newType);
          if (newType === 'TL') {
            node.setAttribute('data-checked', 'TODO');
          }
          return node;
        }
      }
      return node;
    },
    [],
  );

  const selectMajorTag = React.useCallback(
    (tag: MajorTag) => {
      const savedSelection = selectionRef.current;
      if (savedSelection?.anchorNode != null && divRef.current) {
        if (divRef.current.contains(savedSelection.anchorNode)) {
          restoreSavedSelection(savedSelection);
          const majorNodes = getAllSelectedMajorElements();
          majorNodes.forEach(nodeArg => {
            let node = nodeArg;
            if (node.tagName === 'LI') {
              // node is a list: remove list first
              node = toggleListNode(node, 'none');
            }

            // const newNode =
            switchTo(node, tag);
            //            let pos = selection.anchorOffset;
            //            selection.setPosition(newNode, 0);
            //            while (pos > 0){
            //              (selection as SelectionWithModify).modify('move', 'forward', 'character');
            //              pos--;
            //            }
          });
          restoreSavedSelection(savedSelection);
          onInternalChangeCb();
        }
      }
    },
    [getAllSelectedMajorElements, toggleListNode, onInternalChangeCb],
  );

  const toggleList = React.useCallback(
    (type: 'UL' | 'OL' | 'TL') => {
      const majorNodes = getAllSelectedMajorElements();

      // check if selection contains only list items
      const uniqListType = uniq(majorNodes.map(t => t.getAttribute('data-list-type')));
      // check if all list item share the same type
      const currentListType =
        uniqListType.length === 1 && uniqListType[0] != null ? uniqListType[0] : 'none';

      majorNodes.forEach(node => toggleListNode(node, currentListType === type ? 'none' : type));
      const savedSelection = selectionRef.current;
      if (savedSelection) {
        restoreSavedSelection(savedSelection);
      }
      onInternalChangeCb();
    },
    [getAllSelectedMajorElements, onInternalChangeCb, toggleListNode],
  );

  const toggleBold = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleMinorTagCb('STRONG');
      e.preventDefault();
    },
    [toggleMinorTagCb],
  );

  const toggleItalic = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleMinorTagCb('EM');
      e.preventDefault();
    },
    [toggleMinorTagCb],
  );

  const toggleUnderline = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleMinorTagCb('U');
      e.preventDefault();
    },
    [toggleMinorTagCb],
  );

  const toggleStrike = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleMinorTagCb('STRIKE');
      e.preventDefault();
    },
    [toggleMinorTagCb],
  );

  const toggleListCb = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleList('UL');
      e.preventDefault();
    },
    [toggleList],
  );

  const toggleOrderedListCb = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleList('OL');
      e.preventDefault();
    },
    [toggleList],
  );

  const toggleTodoListCb = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleList('TL');
      e.preventDefault();
    },
    [toggleList],
  );

  const onKeyDownCb = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (divRef.current && selectionRef.current) {
          logger.trace('Hit tab');
          const listItem = boundedClosest(selectionRef.current.anchorNode!, ['LI'], divRef.current);
          if (listItem != null) {
            if (e.shiftKey) {
              unindentListItem(listItem);
            } else {
              indentListItem(listItem);
            }
            restoreSavedSelection(selectionRef.current);
            e.preventDefault();
            onInternalChangeCb();
          }
        }
      }
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.key === 'b') {
          toggleBold(e);
          e.preventDefault();
        } else if (e.key === 'i') {
          toggleItalic(e);
          e.preventDefault();
        } else if (e.key === 'u') {
          toggleUnderline(e);
          e.preventDefault();
        } else if (e.key === 's') {
          // ctrl-s is useless (autosave)
          e.preventDefault();
        }
      }
    },
    [toggleBold, toggleItalic, toggleUnderline, onInternalChangeCb],
  );

  const [linkOverlay, setLinkOverlay] = React.useState<LinkOverlay | undefined>(undefined);

  const updateLinkCb = React.useCallback(
    (newUrl: string) => {
      if (linkOverlay) {
        linkOverlay.node.setAttribute('data-link-href', newUrl);
        onInternalChangeCb();
      }
    },
    [linkOverlay, onInternalChangeCb],
  );

  const onClick = React.useCallback((event: MouseEvent) => {
    if (event.target instanceof Element) {
      if (event.target.closest('div.linkOverlay') || event.target.closest('span[data-type=link]')) {
        return;
      }
    }
    setLinkOverlay(undefined);
  }, []);

  React.useEffect(() => {
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, [onClick]);

  const interceptClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.target instanceof Element) {
        if (e.target.tagName === 'LI') {
          // click on todo-list item toggled the state
          if (e.target.firstChild) {
            // hack
            // Since boxes are displayed using CSS pseudoelement, boxes do not exists
            // as DOM nodes.
            // To detect clicks on such "non-existing" nodes, a hack based on mouse position
            // is used.
            const range = new Range();
            range.setStart(e.target.firstChild, 0);
            range.setEnd(e.target.firstChild, 1);
            const { left } = range.getBoundingClientRect();
            if (e.clientX < left) {
              const checked = e.target.getAttribute('data-checked');
              if (checked != null) {
                const newChecked = checked === 'TODO' ? 'DONE' : 'TODO';
                e.target.setAttribute('data-checked', newChecked);
                onInternalChangeCb();
              }
            }
          }
        }
      }
    },
    [onInternalChangeCb],
  );

  const toolbarFormatFeatures = React.useMemo<ToolbarFeatures>(() => {
    return {
      toggleBold: toggleBold,
      toggleItalic: toggleItalic,
      toggleUnderline: toggleUnderline,
      toggleStrike: toggleStrike,
      selectMajorStyle: selectMajorTag,
      toggleList: toggleListCb,
      toggleOrderedList: toggleOrderedListCb,
      toggleTodoList: toggleTodoListCb,
    };
  }, [
    toggleBold,
    toggleItalic,
    toggleStrike,
    toggleUnderline,
    selectMajorTag,
    toggleListCb,
    toggleOrderedListCb,
    toggleTodoListCb,
  ]);

  React.useEffect(() => {
    if (flyingToolBar && selected) {
      setEditToolbar(
        <ToolBar toolbarState={toolbarState} toolbarFormatFeatures={toolbarFormatFeatures} />,
      );
    }
  }, [ToolBar, flyingToolBar, setEditToolbar, toolbarFormatFeatures, toolbarState, selected]);

  React.useEffect(() => {
    if (selected) {
      divRef.current?.focus();
    }
  }, [selected, divRef]);

  const copyCb = React.useCallback((e: React.ClipboardEvent) => {
    logger.trace('OnCopy', e);
    if (logger.getLevel() >= 5) {
      e.clipboardData.types.forEach(t => {
        logger.info(`Copied ${t}: ${e.clipboardData.getData(t)}`);
      });
    }

    const md = domToMarkdown(divRef.current);
    if (md.range.anchor != null && md.range.focus != null) {
      const copiedMd = md.data.substring(md.range.anchor, md.range.focus);
      e.clipboardData.setData('text/x-colab-markdown', copiedMd);
      logger.info('CopiedMD', copiedMd);
    }
  }, []);

  const pasteCb = React.useCallback(
    (e: React.ClipboardEvent) => {
      if (logger.getLevel() >= 5) {
        e.clipboardData.types.forEach(t => {
          logger.trace(`Paste ${t}: ${e.clipboardData.getData(t)}`);
        });
      }

      // supported MIME type only
      const html = e.clipboardData.getData('text/html');
      const plainText = e.clipboardData.getData('text/plain');
      const colabMd = e.clipboardData.getData('text/x-colab-markdown');

      let mdToInsert = '';

      if (colabMd) {
        // use markdows as-is if any
        mdToInsert = colabMd;
      }

      if (!mdToInsert && html) {
        // html is second choice
        // convert pasted html to markdown
        const div = document.createElement('div');
        div.innerHTML = html;
        const toInsert = domToMarkdown(div);
        mdToInsert = toInsert.data;
      }

      if (!mdToInsert && plainText) {
        // plain text is fallback
        // TODO or not TODO? escape plain text
        //mdToInsert = plainText;
        mdToInsert = escapeText(plainText);
      } else {
        logger.warn('No eligible MIME type', e.clipboardData.types);
      }

      if (mdToInsert) {
        logger.trace('ToInsert', mdToInsert);
        const currentMd = domToMarkdown(divRef.current);
        const result = mergeMardown(currentMd, mdToInsert);

        logger.info('Final MD: ', result.data, result.range);

        if (divRef.current) {
          putMarkdownInDom(divRef.current, result, true);
          // trigger change
          onInternalChangeCb();
        }
      }

      e.preventDefault();
    },
    [onInternalChangeCb, putMarkdownInDom],
  );

  return (
    <Flex className={className} direction="column" grow={1} align="stretch">
      {!flyingToolBar && (
        <ToolBar toolbarState={toolbarState} toolbarFormatFeatures={toolbarFormatFeatures} />
      )}
      <Flex
        className={css({
          position: 'relative',
        })}
        direction="column"
        align="stretch"
      >
        <div
          onCopy={copyCb}
          onPaste={pasteCb}
          onClick={interceptClick}
          className={editorStyle}
          ref={divRef}
          tabIndex={0}
          onInput={onInputCb}
          onKeyDown={onKeyDownCb}
          onCompositionStart={logCompStart}
          onCompositionEnd={logCompEnd}
          contentEditable={true}
        ></div>
        <div className={positionOverlayStyle} ref={positionOverlayRef}></div>
        {linkOverlay && (
          <div className={'linkOverlay ' + computeOverlayPosition(linkOverlay.node)}>
            <OpenGraphLink
              url={linkOverlay.href}
              readOnly={false}
              editCb={updateLinkCb}
              setEditingState={() => {
                setLinkOverlay({
                  ...linkOverlay,
                  editing: !linkOverlay.editing,
                });
              }}
              editingStatus={linkOverlay.editing}
            />
          </div>
        )}
        {/*<pre>{value}</pre>*/}
      </Flex>
    </Flex>
  );
}
