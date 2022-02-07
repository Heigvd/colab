/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { BlockDocument, TextDataBlock } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import { useAppDispatch } from '../../../store/hooks';
import Button from '../../common/Button';

export interface BlockDocProps {
  doc: BlockDocument;
}

const addButtonStyle = css({
  marginTop: '20px',
  display: 'block',
  fontSize: '.9em',
  alignSelf: 'flex-start',
});

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
    <Button className={addButtonStyle} icon={faPlus} onClick={createBlock} invertedButton>
      Add new block
    </Button>
  );
}
