/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { $isLinkNode } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import { $selectAll } from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $getSelection,
  $isDecoratorNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import * as React from 'react';
import useTranslations from '../../../../../i18n/I18nContext';
import IconButton from '../../../../common/element/IconButton';
import Flex from '../../../../common/layout/Flex';
import { activeIconButtonInnerStyle, p_xs, space_2xs } from '../../../../styling/style';
import useModal from '../../hooks/useModal';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { InsertLinkDialog } from '../LinkPlugin';
import { InsertTableDialog } from '../TablePlugin/TablePlugin';
import { BlockFormatDropDown, blockTypeToBlockName } from './FormatDropDown';
import TextAlignDropDown from './TextAlignDropDown';

const dividerStyle = css({
  width: '1px',
  backgroundColor: '#eee',
  margin: '0 4px',
});

function Divider(): JSX.Element {
  return <div className={dividerStyle} />;
}

const toolbarStyle = cx(p_xs, css({
  marginBottom: space_2xs,
  background: 'var(--bg-primary)',
  //borderTopLeftRadius: '10px',
  //borderTopRightRadius: '10px',
  overflow: 'auto',
  //height: '36px',
}));

export const toolbarButtonStyle = css({
  border: '0',
  display: 'flex',
  background: 'none',
  borderRadius: '10px',
  padding: '8px',
  cursor: 'pointer',
  verticalAlign: 'middle',
  flexShrink: '0',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:disabled': {
    cursor: 'not-allowed',
  },
  '&:hover:not(:disabled)': {
    backgroundColor: '#eee',
  },
  '&.active': {
    //background: '#dfe8fa4d',
    ...activeIconButtonInnerStyle
  },
});

const activeToolbarButtonStyle = cx(p_xs, css({
  '&.active': {
    ...activeIconButtonInnerStyle
  },
}));

export default function ToolbarPlugin() {
  const i18n = useTranslations();
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = React.useState(editor);
  const [isEditable, setIsEditable] = React.useState(() => editor.isEditable());

  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  const [selectedElementKey, setSelectedElementKey] = React.useState<NodeKey | null>(null);
  const [blockType, setBlockType] = React.useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [alignment, setAlignment] = React.useState<ElementFormatType>('left');
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isStrikethrough, setIsStrikethrough] = React.useState(false);

  const [modal, showModal] = useModal();
  const [isLink, setIsLink] = React.useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();

    // if selection is a range
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, e => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      // if element is null
      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const align = element.getFormatType();
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          setAlignment(align);
        }
      }
      // Todo Handle buttons
    }
  }, [activeEditor]);

  // Resets toolbar when selection or edit or changes
  React.useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  // Enable undo / redo commands on editor
  React.useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener(editable => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        payload => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        payload => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [activeEditor, editor, updateToolbar]);

  // Clear text of all modifications
  const clearFormatting = React.useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $selectAll(selection);
        selection.getNodes().forEach(node => {
          if ($isTextNode(node)) {
            node.setFormat(0);
            node.setStyle('');
            $getNearestBlockElementAncestorOrThrow(node).setFormat('');
          }
          if ($isDecoratorNode(node)) {
            node.setFormat('');
          }
        });
      }
    });
  }, [activeEditor]);

  return (
    <Flex align='center' className={cx(toolbarStyle, 'toolbar')}>
      <IconButton 
        icon={'undo'}
        variant='ghost'
        iconSize='xs'
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className={activeToolbarButtonStyle}
        title={'Undo (Ctrl+Z)'}
        aria-label="Undo" />
        <IconButton 
        icon={'redo'}
        variant='ghost'
        iconSize='xs'
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className={activeToolbarButtonStyle}
        title={'Redo (Ctrl+Y)'}
        aria-label="Redo" />
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown disabled={!isEditable} blockType={blockType} editor={editor} />
          <Divider />
        </>
      )}
      <IconButton 
        icon={'format_bold'}
        variant='ghost'
        iconSize='xs'
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={cx(isBold ? 'active' : '', activeToolbarButtonStyle)}
        title={i18n.modules.content.textFormat.boldSC}
        aria-label={i18n.modules.content.textFormat.formatBold}
        />
        <IconButton 
        icon={'format_italic'}
        variant='ghost'
        iconSize='xs'
        className={cx(isItalic ? 'active' : '', activeToolbarButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        title={i18n.modules.content.textFormat.italicSC}
        aria-label={i18n.modules.content.textFormat.formatItalic}
        />
        <IconButton 
        icon={'format_underlined'}
        variant='ghost'
        iconSize='xs'
        className={cx(isUnderline ? 'active' : '', activeToolbarButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        title={i18n.modules.content.textFormat.underlineSC}
        aria-label={i18n.modules.content.textFormat.formatUnderline}
        />
        <IconButton 
        icon={'strikethrough_s'}
        variant='ghost'
        iconSize='xs'
        className={cx(isStrikethrough ? 'active' : '', activeToolbarButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        title={i18n.modules.content.textFormat.strikeText}
        aria-label={i18n.modules.content.textFormat.formatAsStrike}
        />
        <IconButton 
        icon={'replay'}
        variant='ghost'
        iconSize='xs'
        className={activeToolbarButtonStyle}
        disabled={!isEditable}
        onClick={clearFormatting}
        title={i18n.modules.content.textFormat.clearStyles}
        aria-label={i18n.modules.content.textFormat.clearStyles}
        />
      <Divider />
      {activeEditor === editor && (
        <>
        <TextAlignDropDown editor={editor} alignment={alignment} />
        <Divider />
        </>
      )}
      <IconButton 
        icon={'link'}
        variant='ghost'
        iconSize='xs'
        className={cx(isLink ? 'active' : '', activeToolbarButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          showModal(i18n.modules.content.insertLink, onClose => (
            <InsertLinkDialog activeEditor={activeEditor} onClose={onClose} />
          ));
        }}
        title={i18n.modules.content.insertLink}
        aria-label={i18n.modules.content.insertLink}
        />
      <Divider />
      <IconButton 
        icon={'table'}
        variant='ghost'
        iconSize='xs'
        className={'toolbar-item spaced ' +cx(isLink ? 'active' : '', activeToolbarButtonStyle)}
        disabled={!isEditable}
        onClick={() => {
          showModal(i18n.modules.content.insertTable, onClose => (
            <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
          ));
        }}
        title={i18n.modules.content.insertTable}
        aria-label={i18n.modules.content.insertTable}
        />
      {modal}
    </Flex>
  );
}
