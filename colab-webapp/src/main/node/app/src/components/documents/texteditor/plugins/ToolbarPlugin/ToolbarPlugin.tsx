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
import { $patchStyleText, $selectAll } from '@lexical/selection';
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
  FORMAT_TEXT_COMMAND,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import * as React from 'react';
import { TwitterPicker } from 'react-color';
import useModal from '../../hooks/useModal';
import DropDown from '../../ui/DropDown';
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

const toolbarStyle = css({
  display: 'flex',
  marginBottom: '1px',
  background: '#fff',
  padding: '4px',
  borderTopLeftRadius: '10px',
  borderTopRightRadius: '10px',
  verticalAlign: 'middle',
  overflow: 'auto',
  height: '36px',
});

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
    background: '#dfe8fa4d',
  },
});

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = React.useState(editor);
  const [isEditable, setIsEditable] = React.useState(() => editor.isEditable());

  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  const [selectedElementKey, setSelectedElementKey] = React.useState<NodeKey | null>(null);
  const [blockType, setBlockType] = React.useState<keyof typeof blockTypeToBlockName>('paragraph');
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
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
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

  // Apply currently selected styles (text color or background color)
  const applyStyleText = React.useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [activeEditor],
  );

  // apply selected text color
  const onTextColorSelect = React.useCallback(
    (value: string) => {
      applyStyleText({ color: value });
    },
    [applyStyleText],
  );

  // apply selected background color
  const onBgColorSelect = React.useCallback(
    (value: string) => {
      applyStyleText({ 'background-color': value });
    },
    [applyStyleText],
  );

  return (
    <div className={cx(toolbarStyle, 'toolbar')}>
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        title={'Undo (Ctrl+Z)'}
        type="button"
        className={toolbarButtonStyle}
        aria-label="Undo"
      >
        Undo
      </button>
      <button
        disabled={!canRedo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        title={'Redo (Ctrl+Y)'}
        type="button"
        className={toolbarButtonStyle}
        aria-label="Redo"
      >
        Redo
      </button>
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown disabled={!isEditable} blockType={blockType} editor={editor} />
          <Divider />
        </>
      )}
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={cx(isBold ? 'active' : '', toolbarButtonStyle)}
        title={'Bold (Ctrl+B)'}
        type="button"
        aria-label={`Format text as bold. Shortcut: ${'Ctrl+B'}`}
      >
        B
      </button>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={cx(isItalic ? 'active' : '', toolbarButtonStyle)}
        title={'Italic (Ctrl+I)'}
        type="button"
        aria-label={`Format text as Italic. Shortcut: ${'Ctrl+I'}`}
      >
        I
      </button>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        className={cx(isUnderline ? 'active' : '', toolbarButtonStyle)}
        title={'Underlined (Ctrl+U)'}
        type="button"
        aria-label={`Format text as Underlined. Shortcut: ${'Ctrl+U'}`}
      >
        U
      </button>
      <button
        disabled={!isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        className={cx(isStrikethrough ? 'active' : '', toolbarButtonStyle)}
        title={'Strikethrough (None)'}
        type="button"
        aria-label={`Format text as Strikethrough. Shortcut: ${'None'}`}
      >
        S
      </button>
      <button
        disabled={!isEditable}
        onClick={clearFormatting}
        className={toolbarButtonStyle}
        title="Clear format"
        type="button"
        aria-label="Clear all currently applied styles"
      >
        Reset
      </button>
      <Divider />
      <DropDown
        disabled={false}
        buttonClassName={toolbarButtonStyle}
        buttonIconClassName="icon text-color"
        buttonLabel="Text Color"
        buttonAriaLabel="Text color formatting"
      >
        <TwitterPicker
          colors={['#B54BB2', '#B63E3E', '#3DC15C', '#37A8D8', '#DFCA2A', '#9C9C9C', '#FFFFFF']}
          color="white"
          triangle="hide"
          onChange={newColor => {
            onTextColorSelect(newColor.hex);
          }}
          styles={{
            default: { swatch: { boxShadow: 'inset 0px 0px 3px 1px rgba(0, 0, 0, 0.1)' } },
          }}
        />
      </DropDown>
      <DropDown
        disabled={false}
        buttonClassName={toolbarButtonStyle}
        buttonIconClassName="icon bg-color"
        buttonLabel="Background Color"
        buttonAriaLabel="Background color formatting"
      >
        <TwitterPicker
          colors={['#B54BB2', '#B63E3E', '#3DC15C', '#37A8D8', '#DFCA2A', '#9C9C9C', '#FFFFFF']}
          color="white"
          triangle="hide"
          onChange={newColor => {
            onBgColorSelect(newColor.hex);
          }}
          styles={{
            default: { swatch: { boxShadow: 'inset 0px 0px 3px 1px rgba(0, 0, 0, 0.1)' } },
          }}
        />
      </DropDown>
      <Divider />
      <TextAlignDropDown editor={editor} />
      <Divider />
      <button
        disabled={!isEditable}
        onClick={() => {
          showModal('Insert Link', onClose => (
            <InsertLinkDialog activeEditor={activeEditor} onClose={onClose} />
          ));
        }}
        className={toolbarButtonStyle}
        title={'Link'}
        type="button"
        aria-label={'Insert a new link'}
      >
        Insert link
      </button>
      <Divider />
      <button
        disabled={!isEditable}
        onClick={() => {
          showModal('Insert Table', onClose => (
            <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
          ));
        }}
        className={toolbarButtonStyle}
        title={'Table'}
        type="button"
        aria-label={'Insert a new table'}
      >
        Insert table
      </button>
      {modal}
    </div>
  );
}
