/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  GridSelection,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';
import { sanitizeUrl } from '../../utils/url';
import { floatingToolbarStyle } from './FloatingTextFormatPlugin';

function FloatingLinkEditor({
  editor,
  anchorElement,
  isLink,
  setIsLink,
}: {
  editor: LexicalEditor;
  anchorElement: HTMLElement;
  isLink: boolean;
  setIsLink: React.Dispatch<boolean>;
}): JSX.Element {
  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = React.useState<string>('');
  const [editedLinkUrl, setEditedLinkUrl] = React.useState<string>('');
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const [lastSelection, setLastSelection] = React.useState<
    RangeSelection | GridSelection | NodeSelection | null
  >(null);

  const updateLinkEditor = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else {
        setLinkUrl('');
      }
    }
    const editorElement = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElement === null) return;

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild as HTMLElement;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      setFloatingElemPosition(rect, editorElement, anchorElement);
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== 'link-input') {
      if (rootElement !== null) {
        setFloatingElemPosition(null, editorElement, anchorElement);
      }
      setLastSelection(null);
      setIsEditMode(false);
      setLinkUrl('');
    }

    return true;
  }, [anchorElement, editor]);

  React.useEffect(() => {
    const scrollerElem = anchorElement.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
      });
    };

    window.addEventListener('resize', update);

    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);

      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [anchorElement.parentElement, editor, updateLinkEditor]);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, updateLinkEditor, setIsLink, isLink]);

  React.useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  React.useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  const monitorInputInteraction = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleLinkSubmission();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsEditMode(false);
    }
  };

  const handleLinkSubmission = () => {
    if (lastSelection !== null) {
      if (linkUrl !== '') {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
      }
      setIsEditMode(false);
    }
  };

  return (
    <>
      {!isLink ? null : (
        <div ref={editorRef} className={floatingToolbarStyle}>
          {isEditMode ? (
            <>
              <input
                ref={inputRef}
                className="link-input"
                value={editedLinkUrl}
                onChange={event => {
                  setEditedLinkUrl(event.target.value);
                }}
                onKeyDown={event => {
                  monitorInputInteraction(event);
                }}
              />
              <div>
                <div
                  className="link-cancel"
                  role="button"
                  tabIndex={0}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    setIsEditMode(false);
                  }}
                >
                  Cancel
                </div>

                <div
                  className="link-confirm"
                  role="button"
                  tabIndex={0}
                  onMouseDown={event => event.preventDefault()}
                  onClick={handleLinkSubmission}
                >
                  Accept
                </div>
              </div>
            </>
          ) : (
            <div className="link-view">
              <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                {linkUrl}
              </a>
              <div
                className="link-edit"
                role="button"
                tabIndex={0}
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  setEditedLinkUrl(linkUrl);
                  setIsEditMode(true);
                }}
              >
                Edit
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function useFloatingLinkEditor(
  editor: LexicalEditor,
  anchorElement: HTMLElement,
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = React.useState(editor);
  const [isLink, setIsLink] = React.useState<boolean>(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      if (linkParent != null && autoLinkParent == null) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          setActiveEditor(newEditor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, updateToolbar]);

  return createPortal(
    <FloatingLinkEditor
      editor={activeEditor}
      anchorElement={anchorElement}
      isLink={isLink}
      setIsLink={setIsLink}
    />,
    anchorElement,
  );
}

export default function FloatingLinkEditorPlugin({
  anchorElement = document.body,
}: {
  anchorElement?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditor(editor, anchorElement);
}
