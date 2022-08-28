/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faBold,
  faItalic,
  faList,
  faListOl,
  faStrikethrough,
  faTasks,
  faUnderline,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniq } from 'lodash';
import * as React from 'react';
import * as LiveHelper from '../../../LiveHelper';
import { getLogger } from '../../../logger';
import { CardEditorCTX } from '../../cards/CardEditor';
import DropDownMenu, { Entry } from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import { borderRadius, lightIconButtonStyle, space_S } from '../../styling/style';
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
import { colabFlavouredMarkdown, colabFlavouredMarkdownEditable } from './MarkdownViewer';
import domToMarkdown, { MarkdownWithSelection } from './parser/domToMarkdown';
import markdownToDom, { convertRange } from './parser/markdownToDom';

const logger = getLogger('WysiwygEditor');

/*************************************************
 *    STYLES
 *************************************************/

export const idleStyle = cx(
  lightIconButtonStyle,
  css({
    borderRadius: borderRadius,
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
    backgroundColor: 'var(--lightGray)',
    color: 'var(--primaryColor)',
  }),
);

export const toolbarSeparatorStyle = css({
  paddingLeft: space_S,
  marginLeft: space_S,
  borderLeft: '1px solid var(--lightGray)',
  height: '24px',
});

const editorStyle = cx(
  colabFlavouredMarkdown,
  colabFlavouredMarkdownEditable,
  css({
    backgroundColor: 'var(--bgColor)',
    padding: '5px',
    border: '1px solid var(--lighterGray)',
    borderRadius: borderRadius,
    whiteSpace: 'pre-line',
    cursor: 'text',
    '& .some-cursor': {
      position: 'absolute',
      pointerEvents: 'none',
      userSelect: 'none',
    },
    '&:hover': {
      border: '1px solid var(--lightGray)',
    },
    ':focus, :focus-visible': {
      border: '1px solid var(--darkGray)',
      outline: 'none',
    },
  }),
);

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
  icon: IconProp;
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
  flyingToolBar?: boolean;
  //ToolBar?: React.FunctionComponent<TXTFormatToolbarProps>;
  ToolBar?: React.FunctionComponent<TXTFormatToolbarProps>;
  selected?: boolean;
}

type SelectionWithModify = Selection & {
  modify: (
    alter: 'move' | 'extend',
    direction: 'left' | 'right' | 'forward' | 'backward',
    granularity: 'word',
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
      <FontAwesomeIcon icon={icon} />
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
        icon={faBold}
        toggled={toolbarState.bold}
        onClick={toolbarFormatFeatures.toggleBold}
      />
      <ToolbarButton
        icon={faItalic}
        toggled={toolbarState.italic}
        onClick={toolbarFormatFeatures.toggleItalic}
      />
      <ToolbarButton
        icon={faUnderline}
        toggled={toolbarState.underline}
        onClick={toolbarFormatFeatures.toggleUnderline}
      />
      <ToolbarButton
        icon={faStrikethrough}
        toggled={toolbarState.strike}
        onClick={toolbarFormatFeatures.toggleStrike}
      />
      <ToolbarSeparator />
      <ToolbarButton
        icon={faList}
        toggled={toolbarState.list === 'UL'}
        onClick={toolbarFormatFeatures.toggleList}
      />
      <ToolbarButton
        icon={faListOl}
        toggled={toolbarState.list === 'OL'}
        onClick={toolbarFormatFeatures.toggleOrderedList}
      />
      <ToolbarButton
        icon={faTasks}
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
function computeSelectionOffsets(
  offsets: LiveHelper.Offsets,
  range: MarkdownWithSelection['range'],
) {
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

type SavedSelection = Required<
  Pick<Selection, 'type' | 'anchorNode' | 'anchorOffset' | 'focusNode' | 'focusOffset'>
>;

function restoreSelection(savedSelection: SavedSelection): Selection | null {
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

/**
 * Wysiwyg editor which try to keep selected text accros updates
 */
export default function WysiwygEditor({
  value,
  onChange,
  className,
  flyingToolBar,
  ToolBar = TXTFormatToolbar,
  selected,
}: WysiwygEditorProps): JSX.Element {
  // use a ref to manage editor content
  const divRef = React.useRef<HTMLDivElement>(null);

  // to detect is composition in on going
  const compositionRef = React.useRef(false);
  const { setEditToolbar } = React.useContext(CardEditorCTX);

  const selectionRef = React.useRef<SavedSelection | null>(null);

  const [toolbarState, setToolbarState] = React.useState<ToolbarState>({
    bold: false,
    italic: false,
    strike: false,
    underline: false,
    list: 'none',
    majorStyle: 'P',
  });

  React.useEffect(() => {
    // props just changed
    const div = divRef.current;
    if (div != null) {
      const md = domToMarkdown(divRef.current!);
      if (md.data !== value) {
        // current markdown version is different

        const newDom = markdownToDom(value);

        // make sure div is empty
        while (div.firstChild != null) {
          div.removeChild(div.firstChild);
        }
        newDom.nodes.forEach(n => div.appendChild(n));

        if (md.range.anchor != null || md.range.focus != null) {
          // -> should update selection caret/range
          const diff = LiveHelper.getMicroChange(md.data, value);
          const offsets = LiveHelper.computeOffsets(diff);
          const newRange = computeSelectionOffsets(offsets, md.range);

          const domRange = convertRange(newDom, newRange);
          if (domRange != null) {
            const selection = window.getSelection();
            if (selection != null) {
              selection.removeAllRanges();
              selection.addRange(domRange);
            }
          }
          // TODO: compute new Range
        }
      }
    }
  }, [value]);

  const getAllSelectedMajorElements = React.useCallback(() => {
    const majorNodes: Element[] = [];
    const selection = document.getSelection();
    if (selection?.anchorNode != null && divRef.current) {
      if (divRef.current.contains(selection.anchorNode)) {
        if (selection.type === 'Caret') {
          const current = boundedClosest(selection.anchorNode!, majorTags, divRef.current);
          if (current) {
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
    const selection = document.getSelection();
    if (selection != null) {
      if (selection?.anchorNode != null && divRef.current) {
        if (divRef.current.contains(selection.anchorNode)) {
          // since getSelection return a mutable object, make sure to make a copy
          selectionRef.current = {
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode,
            focusOffset: selection.focusOffset,
            type: selection.type,
          };
        }
      }

      updateToolbar();
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
  }, [updateToolbar]);

  /* Register onSelectionChange event listener */
  React.useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [onSelectionChange]);

  const onInternalChangeCb = React.useCallback(() => {
    updateToolbar();
    const md = domToMarkdown(divRef.current!);
    onChange(md.data);
  }, [onChange, updateToolbar]);

  const onInputCb = React.useCallback(
    (e: React.FormEvent) => {
      if ('isComposing' in e.nativeEvent) {
        const tE = e.nativeEvent as unknown as { isComposing: boolean };
        if (tE.isComposing === false) {
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
          const selection = restoreSelection(savedSelection);

          let originalCaret: { node: Node; offset: number } | null = null;

          if (selection?.type === 'Caret') {
            originalCaret = { node: selection.anchorNode!, offset: selection.anchorOffset };
            (selection as SelectionWithModify).modify('move', 'backward', 'word');
            (selection as SelectionWithModify).modify('extend', 'forward', 'word');
          }
          if (selection?.type === 'Range') {
            logger.info('Selection: ', savedSelection);
            const nodes = sortNodes(
              { node: selection!.anchorNode!, offset: selection!.anchorOffset },
              { node: selection!.focusNode!, offset: selection!.focusOffset },
            );
            if (originalCaret) {
              document.getSelection()?.setPosition(originalCaret.node, originalCaret.offset);
            }
            const range = toggleTag(nodes.left, nodes.right, tagName, divRef.current);
            document
              .getSelection()
              ?.setBaseAndExtent(
                range.start.node,
                range.start.offset,
                range.end.node,
                range.end.offset,
              );
            onInternalChangeCb();
          } else {
            //const range = document.createRange();
            //range.setStart(selection.anchorNode, selection.anchorOffset);
          }
        }
      }
    },
    [onInternalChangeCb],
  );

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
          restoreSelection(savedSelection);
          const majorNodes = getAllSelectedMajorElements();
          majorNodes.forEach(nodeArg => {
            let node = nodeArg;
            if (node.tagName === 'LI') {
              // node is a list: remove list first
               node = toggleListNode(node, 'none');
            }

            const selection = document.getSelection()!;
            const newNode = switchTo(node, tag);
            selection.setPosition(newNode, selection.anchorOffset);
          });
        }
      }
    },
    [getAllSelectedMajorElements, toggleListNode],
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
        restoreSelection(savedSelection);
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
            restoreSelection(selectionRef.current);
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

  const interceptClick = React.useCallback(
    (e: React.MouseEvent) => {
      // click on todo-list item toggled the state
      if (e.target instanceof Element) {
        if (e.target.tagName === 'LI') {
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
      e.target;
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

  return (
    <Flex className={className} direction="column" grow={1} align="stretch">
      {!flyingToolBar && (
        <ToolBar toolbarState={toolbarState} toolbarFormatFeatures={toolbarFormatFeatures} />
      )}
      <Flex direction="column" align="stretch">
        <div
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
      </Flex>
    </Flex>
  );
}
