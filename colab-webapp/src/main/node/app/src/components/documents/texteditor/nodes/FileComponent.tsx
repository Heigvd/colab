/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  LexicalEditor,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as API from '../../../../API/api';
import logger from '../../../../logger';
import Icon from '../../../common/layout/Icon';
import { $isFileNode } from './FileNode';

export default function FileComponent({
  className,
  docId,
  fileName,
  nodeKey,
}: {
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  docId: number;
  fileName: string;
  nodeKey: NodeKey;
}): JSX.Element {
  const fileRef = useRef<null | HTMLAnchorElement>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isFileNode(node)) {
          node.remove();
        }
        setSelected(false);
        // TODO Delete file in REST when called
        logger.info(editor._config);
      }
      return false;
    },
    [editor._config, isSelected, nodeKey, setSelected],
  );

  useEffect(() => {
    let isMounted = true;
    setDownloadUrl(API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(docId));
    const unregister = mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
    );
    return () => {
      isMounted = false;
      unregister();
    };
  }, [docId, editor, fileName, onDelete]);

  return (
    <>
      <BlockWithAlignableContents className={className} nodeKey={nodeKey}>
        <div className={css({ display: 'flex', alignItems: 'center' })}>
          <Icon icon={'description'} opsz="sm" />
          <a href={downloadUrl} ref={fileRef}>
            {fileName}
          </a>
        </div>
      </BlockWithAlignableContents>
    </>
  );
}
