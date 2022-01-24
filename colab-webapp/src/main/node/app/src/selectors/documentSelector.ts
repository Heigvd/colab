/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document, entityIs } from 'colab-rest-client';
import { useAppSelector } from '../store/hooks';
import { LoadingStatus } from '../store/store';

export const useDocument = (
  id: number | null | undefined,
): Document | LoadingStatus | undefined => {
  return useAppSelector(state => {
    if (id != null) {
      const docDetail = state.document.documents[id];

      if (docDetail === null) {
        return 'LOADING';
      } else {
        return docDetail;
      }
    }
    return undefined;
  }); // refEqual is fine
};

export const useDeliverables = (cardContentId: number | null | undefined): Document[] | undefined => {
  return useAppSelector(state => {
    const result: Document[] = [];

    if (cardContentId != null) {
      Object.values(state.document.documents).forEach(doc => {
        if (doc && entityIs(doc, 'Document')) {
          if (doc.owningCardContentId === cardContentId) {
            result.push(doc);
          }
        }
      });
    }

// kaï aïe how to know if they are already loaded ?

    return result;
  });
};
