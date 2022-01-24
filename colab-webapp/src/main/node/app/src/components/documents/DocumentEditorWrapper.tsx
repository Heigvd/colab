/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useDeliverables, useDocument } from '../../selectors/documentSelector';
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

  const docs = useDeliverables(cardContentId);

  // note : quick and dirty changed to be compatible with an array of docs... 
  // but only the case of exactly 1 doc is handled !!!

  React.useEffect(() => {
    // TODO find a way to handle if no document
    if ((!docs || docs.length < 1) && cardContentId != null) {
      dispatch(API.getDeliverablesOfCardContent(cardContentId));
    }
  }, [docs, cardContentId, dispatch]);

  if (docs == null || docs[0] == null) {
    return <InlineLoading />;
  } else if (entityIs(docs[0], 'Document')) {
    return <DocumentEditorDisplay document={docs[0]} allowEdition={allowEdition} />;
  } else {
    return <InlineLoading />;
  }
}
