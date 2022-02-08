/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document, entityIs } from 'colab-rest-client';
import { DocumentContext } from '../components/documents/documentCommonType';
import { useAppSelector } from '../store/hooks';
import { LoadingStatus } from '../store/store';

export const useDocuments = (
  context: DocumentContext,
): {
  documents: Document[];
  status: LoadingStatus;
} => {
  return useAppSelector(state => {
    let dataInStore; // = { number[]; status: 'NOT_INITIALIZED' };
    if (context.kind == 'DeliverableOfCardContent' && context.cardContentId != null) {
      dataInStore = state.document.byCardContent[context.cardContentId];
    } else if (context.kind == 'PartOfResource' && context.resourceId != null) {
      dataInStore = state.document.byResource[context.resourceId];
    } else {
      return { documents: [], status: 'NOT_INITIALIZED' };
    }

    if (dataInStore === undefined) {
      return { documents: [], status: 'NOT_INITIALIZED' };
    } else {
      const { documentIds, status } = dataInStore;

      if (status == 'LOADING') {
        return { documents: [], status: 'LOADING' };
      } else {
        return {
          documents: documentIds.flatMap(docId => {
            const doc = state.document.documents[docId];
            return doc && entityIs(doc, 'Document') ? [doc] : [];
          }),
          status: 'READY',
        };
      }
    }
  });
};
