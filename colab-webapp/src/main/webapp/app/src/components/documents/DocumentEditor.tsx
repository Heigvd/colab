/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import {useDocument} from '../../selectors/documentSelector';
import {useAppDispatch} from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';


export interface DocEditorProps {
  docId: number;
}


export function DocumentEditor({docId}: DocEditorProps): JSX.Element {

  const dispatch = useAppDispatch();

  const doc = useDocument(docId);

  if (doc == undefined && docId != null) {
    dispatch(API.getDocument(docId));
  }

  if (doc == null || doc == 'LOADING') {
    return <InlineLoading />
  } else {
    return (
      <div>
        <i>document editor</i>
      </div>
    );
  }
}