/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';
import { BlockDocument, TextDataBlock } from 'colab-rest-client';
import { useAppDispatch } from '../../../store/hooks';
import IconButton from '../../common/IconButton';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export interface BlockDocProps {
  doc: BlockDocument;
}

export function CreateBlockButton({ doc }: BlockDocProps): JSX.Element {
  const dispatch = useAppDispatch();

  const createBlock = React.useCallback(() => {
    const block: TextDataBlock = {
      '@class': 'TextDataBlock',
      revision: '0',
      mimeType: 'text/markdown',
    };
    dispatch(API.createBlock({ document: doc, block: block }));
  }, [doc, dispatch]);

  return (
    <IconButton icon={faPlus} onClick={createBlock}>
      Create a new block
    </IconButton>
  );
}
