/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useDeliverable, useDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import { DocumentEditorDisplay } from './DocumentEditorDisplay';

export interface DocByIdWrapperProps {
  docId: number;
  allowEdition?: boolean;
}

export function DocumentEditorWrapper({
  docId,
  allowEdition = true,
}: DocByIdWrapperProps): JSX.Element {
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
    return <DocumentEditorDisplay document={doc} allowEdition={allowEdition} />;
  } else {
    return <InlineLoading />;
  }
}

export interface DocAsDeliverableProps {
  cardContentId: number;
  allowEdition?: boolean;
}

export function DocumentEditorAsDeliverableWrapper({
  cardContentId,
  allowEdition,
}: DocAsDeliverableProps): JSX.Element {
  const dispatch = useAppDispatch();

  const doc = useDeliverable(cardContentId);

  React.useEffect(() => {
    if (doc == undefined && cardContentId != null) {
      dispatch(API.getDeliverableOfCardContent(cardContentId));
    }
  }, [doc, cardContentId, dispatch]);

  if (doc == null) {
    return <InlineLoading />;
  } else if (entityIs(doc, 'Document')) {
    return <DocumentEditorDisplay document={doc} allowEdition={allowEdition} />;
  } else {
    return <InlineLoading />;
  }
}
