/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import { DocumentEditorDisplay } from './DocumentEditorDisplay';

export interface DocEditorProps {
  docId: number;
}

export function DocumentEditorWrapper({ docId }: DocEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const doc = useDocument(docId);

  React.useEffect(() => {
    if (doc == undefined && docId != null) {
      dispatch(API.getDocument(docId));
    }
  }, [doc, docId, dispatch]);

  if (doc == null || doc == 'LOADING') {
    return <InlineLoading />;
  } else if (entityIs(doc, 'Document')) {
    return <DocumentEditorDisplay document={doc} />;
  } else {
    return <InlineLoading />;
  }
}
