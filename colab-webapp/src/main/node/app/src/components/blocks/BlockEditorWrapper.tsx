/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useTextDataBlock } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import LiveEditor from '../live/LiveEditor';

export interface BlockEditorProps {
  blockId: number;
  allowEdition?: boolean;
}

export function BlockEditorWrapper({ blockId, allowEdition }: BlockEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const {block, status} = useTextDataBlock(blockId);

  React.useEffect(() => {
    if (status == 'NOT_INITIALIZED' && blockId != null) {
      dispatch(API.getDocument(blockId));
    }
  }, [status, blockId, dispatch]);

  if (status == 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status == 'LOADING') {
    return <InlineLoading  />;
  } else if (block == null) {
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
