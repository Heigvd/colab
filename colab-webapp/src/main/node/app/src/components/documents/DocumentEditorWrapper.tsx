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
import { workInProgressStyle } from '../styling/style';
import DocumentCreatorButton, { CreationContextKind } from './DocumentCreatorButton';
import { DocumentEditorDisplay } from './DocumentEditorDisplay';

export interface DocAsDeliverableProps {
  cardContentId: number;
  allowEdition?: boolean;
}

export function DocumentEditorWrapper({
  cardContentId,
  allowEdition,
}: DocAsDeliverableProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { documents, status } = useDeliverables(cardContentId);

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
    <div className={workInProgressStyle}>
      {
        documents
          .sort((a, b) => (a.index || 0) - (b.index || 0))
          .map(doc => <DocumentEditorDisplay key={doc.id} document={doc} allowEdition={allowEdition} />)
      }
      {allowEdition &&
        <DocumentCreatorButton
          creationContext={{ kind: CreationContextKind.CardContent, cardContentId: cardContentId }}
          docType='TextDataBlock' title='add a block' />}
      {allowEdition &&
        <DocumentCreatorButton
          creationContext={{ kind: CreationContextKind.CardContent, cardContentId: cardContentId }}
          docType='DocumentFile' title='add a file' />}
      {allowEdition &&
        <DocumentCreatorButton
          creationContext={{ kind: CreationContextKind.CardContent, cardContentId: cardContentId }}
          docType='ExternalLink' title='add a link' />}
    </div>
  );

}
