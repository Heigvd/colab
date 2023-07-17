/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
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
import logger from '../../../../../logger';
import { lightIconButtonStyle, linkStyle, space_md } from '../../../../../styling/style';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';
import { $isFileNode, FileNode } from '../../nodes/FileNode';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';
import { floatingToolbarStyle } from './FloatingTextFormatPlugin';

function FloatingFileEditor({
  editor,
  anchorElement,
  isFile,
  setIsFile,
}: {
  editor: LexicalEditor;
  anchorElement: HTMLElement;
  isFile: boolean;
  setIsFile: React.Dispatch<boolean>;
}): JSX.Element {
  const i18n = useTranslations();

  const floatingToolbarRef = React.useRef<HTMLDivElement | null>(null);
  const [fileUrl, setFileUrl] = React.useState<string>('');

  const updateFileEditor = React.useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) return;

    const nodes = selection?.getNodes();
    const fileNode = nodes?.find(n => n.__type === 'file') as FileNode;

    const floatingToolbarElement = floatingToolbarRef.current;
    logger.info('editorRef', floatingToolbarRef);

    if (floatingToolbarElement === null) return;

    const rootElement = editor.getRootElement();

    if (nodes != null && fileNode != null && rootElement !== null && editor.isEditable()) {
      setFileUrl(fileNode.getFileUrl());
      const fileNodeDom = editor.getElementByKey(fileNode.getKey());
      const fileNodeRect = fileNodeDom!.getBoundingClientRect();
      setFloatingElemPosition(fileNodeRect, floatingToolbarElement, anchorElement);
    } else {
      setFloatingElemPosition(null, floatingToolbarElement, anchorElement);
    }

    return true;
  }, [anchorElement, editor]);

  React.useEffect(() => {
    const scrollerElement = anchorElement.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateFileEditor();
      });
    };

    window.addEventListener('resize', update);

    if (scrollerElement) {
      scrollerElement.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);

      if (scrollerElement) {
        scrollerElement.removeEventListener('scroll', update);
      }
    };
  }, [anchorElement.parentElement, editor, updateFileEditor]);

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateFileEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateFileEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isFile) {
            setIsFile(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, isFile, setIsFile, updateFileEditor]);

  React.useEffect(() => {
    editor.getEditorState().read(() => {
      updateFileEditor();
    });
  }, [editor, updateFileEditor]);

  return (
    <>
      {!isFile ? null : (
        <div ref={floatingToolbarRef} className={floatingToolbarStyle} id="asdf">
          {editor.isEditable() && (
            <>
              <a href={fileUrl} rel="noopener noreferrer" className={css({ alignSelf: 'center' })}>
                <Flex className={linkStyle}>
                  {i18n.modules.content.dlFile}
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
            </>
          )}
        </div>
      )}
    </>
  );
}

function useFloatingFileEditor(
  editor: LexicalEditor,
  anchorElement: HTMLElement,
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = React.useState(editor);
  const [isFile, setIsFile] = React.useState<boolean>(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    const nodes = selection?.getNodes();
    const fileNode = nodes?.find(n => n.__type === 'file');

    if (fileNode != null && $isFileNode(fileNode)) {
      setIsFile(true);
    } else {
      setIsFile(false);
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
    <FloatingFileEditor
      editor={activeEditor}
      anchorElement={anchorElement}
      isFile={isFile}
      setIsFile={setIsFile}
    />,
    anchorElement,
  );
}

export default function FloatingFileMenuPlugin({
  anchorElement = document.body,
}: {
  anchorElement?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingFileEditor(editor, anchorElement);
}
