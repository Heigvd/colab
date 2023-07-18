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
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
} from 'lexical';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as API from '../../../../API/api';
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
  const fileDivContainerRef = useRef<null | HTMLDivElement>(null);
  const fileIconRef = useRef<null | HTMLSpanElement>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const onDelete = React.useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isFileNode(node)) {
            node.remove();

            // TODO Delete file in REST when called
          }
          setSelected(false);
        });
      }
      return false;
    },
    [editor, isSelected, nodeKey, setSelected],
  );

  useEffect(() => {
    setDownloadUrl(API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(docId));

    const unregister = mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        payload => {
          const event = payload;

          if (
            event.target === fileDivContainerRef.current ||
            event.target === fileIconRef.current
          ) {
            clearSelection();
            setSelected(true);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),

      // TODO to prevent copy paste (which is hard to handle for a link to external data),
      // we could handle COPY_COMMAND so that the clipboard data is replaced by a simple text
      // only containing the filename
    );
    return () => {
      unregister();
    };
  }, [docId, editor, onDelete, clearSelection, setSelected]);

  return (
    <>
      <BlockWithAlignableContents className={className} nodeKey={nodeKey}>
        <div className={css({ display: 'flex', alignItems: 'center' })} ref={fileDivContainerRef}>
          <Icon icon={'description'} opsz="sm" theRef={fileIconRef} />
          <a href={downloadUrl}>{fileName}</a>
        </div>
      </BlockWithAlignableContents>
    </>
  );
}
