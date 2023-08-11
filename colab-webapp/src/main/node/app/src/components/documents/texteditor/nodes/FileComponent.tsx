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
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW, NodeKey } from 'lexical';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as API from '../../../../API/api';
import Icon from '../../../common/layout/Icon';

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
  const [_isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  useEffect(() => {
    setDownloadUrl(API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(docId));
  }, [docId]);

  useEffect(() => {
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
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
    return () => {
      unregister();
    };
  }, [docId, editor, clearSelection, setSelected]);

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
