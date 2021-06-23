/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Change, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import LiveTextEditor from '../live/LiveTextEditor';

export interface BlockEditorProps {
  blockId: number;
}

export function BlockEditorWrapper({ blockId }: BlockEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const block = useAppSelector(state => {
    return state.block.blocks[blockId];
  });

  const onChangeCb = React.useCallback(
    (change: Change) => {
      dispatch(API.patchBlock({ id: blockId, change: change }));
    },
    [dispatch, blockId],
  );

  if (block == undefined && blockId != null) {
    dispatch(API.getBlock(blockId));
  }

  if (block == null) {
    return <InlineLoading />;
  } else {
    if (entityIs(block, 'TextDataBlock')) {
      switch (block.mimeType) {
        case 'text/markdown':
          return (
            <LiveTextEditor
              atClass={block['@class']}
              atId={blockId}
              value={block.textData || ''}
              onChange={onChangeCb}
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
