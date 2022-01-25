/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useDeliverables } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import { DocumentEditorDisplay } from './DocumentEditorDisplay';

export interface DocByIdWrapperProps {
  docId: number;
  allowEdition?: boolean;
}

/*
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
*/

export interface DocAsDeliverableProps {
  cardContentId: number;
  allowEdition?: boolean;
}

export function DocumentEditorAsDeliverableWrapper({
  cardContentId,
  allowEdition,
}: DocAsDeliverableProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { documents, status } = useDeliverables(cardContentId);

  // note : quick and dirty changed to be compatible with an array of docs... 
  // but only the case of exactly 1 doc is handled !!!

  React.useEffect(() => {
    if (status == 'NOT_INITIALIZED' && cardContentId != null) {
      dispatch(API.getDeliverablesOfCardContent(cardContentId));
    }
  }, [status, cardContentId, dispatch]);


  if (status === 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else if (documents == null || documents.length < 1) {
    return <div>no document at disposal</div>;
  }

  return (
    <div>
      {
        documents.map(doc => <DocumentEditorDisplay key={doc.id} document={doc} allowEdition={allowEdition} />)
      }
    </div>
  );

}
