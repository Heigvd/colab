/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode } from '@lexical/rich-text';
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import * as React from 'react';
import { BlockFormatDropDown, blockTypeToBlockName } from './FormatDropDown';

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
      // const node = getSelectedNode(selection);
      // const parent = node.getParent();
      // if ($isLinkNode(parent) || $isLinkNode(node)) {
      //   setIsLink(true);
      // } else {
      //   setIsLink(false);
      // }

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

  // Resets toolbar when selection or editor changes
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

  return (
    <div className={cx(toolbarStyle, 'toolbar')}>
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        title={'Undo (Ctrl+Z)'}
        type="button"
        className="toolbar-item"
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
        className="toolbar-item"
        aria-label="Redo"
      >
        Redo
      </button>
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown disabled={!isEditable} blockType={blockType} editor={editor} />
        </>
      )}
    </div>
  );
}
