/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  BaseSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { createPortal } from 'react-dom';
import useTranslations from '../../../../../i18n/I18nContext';
import { lightIconButtonStyle, space_md } from '../../../../../styling/style';
import IconButton from '../../../../common/element/IconButton';
import { inputStyle } from '../../../../common/element/Input';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';
import { sanitizeUrl } from '../../utils/url';
import { activeToolbarButtonStyle, TOGGLE_LINK_MENU_COMMAND } from '../ToolbarPlugin/ToolbarPlugin';
import { floatingToolbarStyle } from './FloatingTextFormatPlugin';

const linkStyle = css({
  margin: 'auto',
  padding: '4px',
});

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
}): React.ReactElement {
  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = React.useState<string>('');
  const [editedLinkUrl, setEditedLinkUrl] = React.useState<string>('');
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const [lastSelection, setLastSelection] = React.useState<BaseSelection | null>(null);

  const i18n = useTranslations();

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

  React.useEffect(() => {
    return editor.registerCommand(
      TOGGLE_LINK_MENU_COMMAND,
      payload => {
        setEditedLinkUrl('https://');
        setIsEditMode(true);
        return editor.dispatchCommand(TOGGLE_LINK_COMMAND, payload);
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

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

  const handleLinkRemoval = () => {
    if (lastSelection !== null) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  };

  return (
    <>
      {!isLink ? null : (
        <div ref={editorRef} className={floatingToolbarStyle}>
          {isEditMode ? (
            <>
              <input
                style={{ marginRight: '4px' }}
                ref={inputRef}
                className={inputStyle}
                value={editedLinkUrl}
                onChange={event => {
                  setEditedLinkUrl(event.target.value);
                }}
                onKeyDown={event => {
                  monitorInputInteraction(event);
                }}
              />
              <IconButton
                icon={'cancel'}
                iconSize="xs"
                title={i18n.common.cancel}
                aria-label={i18n.common.cancel}
                tabIndex={0}
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  setIsEditMode(false);
                }}
                className={activeToolbarButtonStyle}
              />
              <IconButton
                icon={'check'}
                iconSize="xs"
                title={i18n.common.confirm}
                aria-label={i18n.common.confirm}
                tabIndex={0}
                onMouseDown={event => event.preventDefault()}
                onClick={handleLinkSubmission}
                className={activeToolbarButtonStyle}
              />
            </>
          ) : (
            <>
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={css({ alignSelf: 'center' })}
              >
                <Flex className={linkStyle}>
                  {linkUrl}
                  <Icon
                    icon={'open_in_new'}
                    opsz="xs"
                    title={i18n.modules.content.openLink}
                    aria-label={i18n.modules.content.openLink}
                    tabIndex={0}
                    className={cx(lightIconButtonStyle, css({ paddingLeft: space_md }))}
                  />
                </Flex>
              </a>
              <IconButton
                icon={'edit'}
                iconSize="xs"
                title={i18n.modules.content.editLink}
                aria-label={i18n.modules.content.editLink}
                tabIndex={0}
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  setEditedLinkUrl(linkUrl);
                  setIsEditMode(true);
                }}
                className={activeToolbarButtonStyle}
              />
              <IconButton
                icon={'delete'}
                iconSize="xs"
                title={i18n.modules.content.removeLink}
                aria-label={i18n.modules.content.removeLink}
                tabIndex={0}
                onMouseDown={event => event.preventDefault()}
                onClick={handleLinkRemoval}
                className={activeToolbarButtonStyle}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}

function useFloatingLinkEditor(
  editor: LexicalEditor,
  anchorElement: HTMLElement,
): React.ReactElement | null {
  const [activeEditor, setActiveEditor] = React.useState(editor);
  const [isLink, setIsLink] = React.useState<boolean>(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if ($isLinkNode(parent) || $isLinkNode(node)) {
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
}): React.ReactElement | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditor(editor, anchorElement);
}
