/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faBold, faItalic, faStrikethrough, faUnderline } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as LiveHelper from '../../../LiveHelper';
import { getLogger } from '../../../logger';
import { CardEditorCTX } from '../../cards/CardEditor';
import Tips from '../../common/element/Tips';
import Flex from '../../common/layout/Flex';
import { borderRadius, lightIconButtonStyle } from '../../styling/style';
import {
  areAllLeafsWrappedByTag,
  boundedClosest,
  MinorTag,
  moveToLeaf,
  sortNodes,
  toggleTag,
} from './DomHelper';
import { colabFlavouredMarkdown } from './MarkdownViewer';
import domToMarkdown, { MarkdownWithSelection } from './parser/domToMarkdown';
import markdownToDom, { convertRange, HeadingLevel } from './parser/markdownToDom';

const logger = getLogger('WysiwygEditor');

/*************************************************
 *    STYLES
 *************************************************/

const idleStyle = cx(
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

const toggledStyle = cx(
  idleStyle,
  css({
    backgroundColor: 'var(--lightGray)',
    color: 'var(--primaryColor)',
  }),
);

const editorStyle = cx(
  colabFlavouredMarkdown,
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

export interface ToolbarState {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  underline: boolean;
  heading: HeadingLevel | 0;
}

export interface ToolbarFeatures {
  toggleBold: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleItalic: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleUnderline: (e: React.MouseEvent | React.KeyboardEvent) => void;
  toggleStrike: (e: React.MouseEvent | React.KeyboardEvent) => void;
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

/*************************************************
 *    COMPONENTS
 *************************************************/

function ToolbarButton({ toggled, onClick, icon }: ToolbarButtonProps) {
  return (
    <span
      className={cx('fa-layers', toggled ? toggledStyle : idleStyle)}
      onMouseDownCapture={onClick}
    >
      <FontAwesomeIcon icon={icon} />
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}

export function TXTFormatToolbar({ toolbarState, toolbarFormatFeatures }: TXTFormatToolbarProps) {
  return (
    <Flex>
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
      <Tips tipsType="TODO" className={lightIconButtonStyle}>
        TODO: add more styling options (headings level, lists, ...
      </Tips>
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

  const [toolbarState, setToolbarState] = React.useState<ToolbarState>({
    bold: false,
    italic: false,
    strike: false,
    underline: false,
    heading: 0,
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

  const updateToolbar = React.useCallback(() => {
    const selection = document.getSelection();
    if (selection != null) {
      if (divRef.current) {
        if (selection.type === 'Caret') {
          const isBold = boundedClosest(selection.anchorNode!, 'STRONG', divRef.current) != null;
          const isItalic = boundedClosest(selection.anchorNode!, 'EM', divRef.current) != null;
          const isStrike = boundedClosest(selection.anchorNode!, 'STRIKE', divRef.current) != null;
          const isUnderline = boundedClosest(selection.anchorNode!, 'U', divRef.current) != null;

          setToolbarState({
            bold: isBold,
            italic: isItalic,
            strike: isStrike,
            underline: isUnderline,
            heading: 0,
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

          setToolbarState({
            bold: isBold,
            italic: isItalic,
            strike: isStrike,
            underline: isUnderline,
            heading: 0,
          });
        }
      }
    }
  }, []);

  const onSelectionChange = React.useCallback(() => {
    const selection = document.getSelection();
    if (selection != null) {
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

  const toggleTagCb = React.useCallback(
    (tagName: MinorTag) => {
      const selection = window.getSelection();
      if (selection?.anchorNode != null && divRef.current) {
        if (divRef.current.contains(selection.anchorNode)) {
          let originalCaret: { node: Node; offset: number } | null = null;

          if (selection.type === 'Caret') {
            originalCaret = { node: selection.anchorNode, offset: selection.anchorOffset };
            (selection as SelectionWithModify).modify('move', 'backward', 'word');
            (selection as SelectionWithModify).modify('extend', 'forward', 'word');
          }
          if (selection.type === 'Range') {
            logger.info('Selection: ', selection);
            const nodes = sortNodes(
              { node: selection.anchorNode, offset: selection.anchorOffset },
              { node: selection.focusNode!, offset: selection.focusOffset },
            );
            if (originalCaret) {
              selection.setPosition(originalCaret.node, originalCaret.offset);
            }
            toggleTag(nodes.left, nodes.right, tagName, divRef.current);
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

  const toggleBold = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleTagCb('STRONG');
      e.preventDefault();
    },
    [toggleTagCb],
  );

  const toggleItalic = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleTagCb('EM');
      e.preventDefault();
    },
    [toggleTagCb],
  );

  const toggleUnderline = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleTagCb('U');
      e.preventDefault();
    },
    [toggleTagCb],
  );

  const toggleStrike = React.useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      toggleTagCb('STRIKE');
      e.preventDefault();
    },
    [toggleTagCb],
  );

  const onKeyDownCb = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        if (e.key === 'b') {
          toggleBold(e);
        } else if (e.key === 'i') {
          toggleItalic(e);
        } else if (e.key === 'u') {
          toggleUnderline(e);
        } else if (e.key === 's') {
          // ctrl-s is useless (autosave)
          e.preventDefault();
        }
      }
    },
    [toggleBold, toggleItalic, toggleUnderline],
  );

  const interceptClick = React.useCallback(
    (e: React.UIEvent) => {
      // click on todo-list item toggled the state
      if (e.target instanceof Element) {
        if (e.target.tagName === 'LI') {
          const checked = e.target.getAttribute('data-checked');
          if (checked != null) {
            const newChecked = checked === 'TODO' ? 'DONE' : 'TODO';
            e.target.setAttribute('data-checked', newChecked);
            onInternalChangeCb();
          }
        }
      }
      e.target;
    },
    [onInternalChangeCb],
  );

  const toolbarFormatFeatures = React.useMemo(() => {
    return {
      toggleBold: toggleBold,
      toggleItalic: toggleItalic,
      toggleUnderline: toggleUnderline,
      toggleStrike: toggleStrike,
    };
  }, [toggleBold, toggleItalic, toggleStrike, toggleUnderline]);

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
