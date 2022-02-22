/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import InlineLoading from '../common/InlineLoading';
import LiveEditor, { EditState } from '../live/LiveEditor';
import { useBlock } from '../live/LiveTextEditor';

export interface BlockEditorProps {
  blockId: number;
  allowEdition?: boolean;
  editingStatus?: EditState;
  className?: string;
}

export function BlockEditorWrapper({
  blockId,
  allowEdition,
  editingStatus,
  className,
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
              editingStatus={editingStatus || { status: 'VIEW' }}
              className={className}
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
