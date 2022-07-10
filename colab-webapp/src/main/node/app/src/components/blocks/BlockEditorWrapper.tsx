/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import InlineLoading from '../common/element/InlineLoading';
import LiveEditor from '../live/LiveEditor';
import { useBlock } from '../live/LiveTextEditor';
import { TXTFormatToolbarProps } from './markdown/WysiwygEditorCustom';

export interface BlockEditorProps {
  blockId: number;
  allowEdition?: boolean;
  editingStatus?: boolean;
  showTree?: boolean;
  markDownEditor?: boolean;
  className?: string;
  selected?: boolean;
  flyingToolBar?: boolean;
  toolBar?: React.FunctionComponent<TXTFormatToolbarProps>;
}

export function BlockEditorWrapper({
  blockId,
  allowEdition,
  editingStatus,
  showTree,
  markDownEditor,
  className,
  selected,
  flyingToolBar,
  toolBar,
}: BlockEditorProps): JSX.Element {
  const block = useBlock(blockId);
  if (block == null) {
    return <InlineLoading />;
  } else {
    if (entityIs(block, 'TextDataBlock')) {
      switch (block.mimeType) {
        case 'text/markdown':
          return (
            <LiveEditor
              allowEdition={allowEdition}
              atClass={block['@class']}
              atId={blockId}
              value={block.textData || ''}
              revision={block.revision}
              editingStatus={editingStatus}
              showTree={showTree}
              markDownEditor={markDownEditor}
              className={className}
              selected={selected}
              flyingToolBar={flyingToolBar}
              toolBar={toolBar}
            />
          );
        default:
          return <span>unkwnon MIME type: {block.mimeType}</span>;
      }
    } else {
      return (
        <div>
          <i>Unknown document</i>
        </div>
      );
    }
  }
}
