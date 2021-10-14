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

export const useDeliverable = (cardContentId: number | null | undefined): Document | undefined => {
  return useAppSelector(state => {
    let document = undefined;

    if (cardContentId != null) {
      Object.values(state.document.documents).forEach(doc => {
        if (doc && entityIs(doc, 'Document')) {
          if (doc.deliverableCardContentId === cardContentId) {
            document = doc;
          }
        }
      });
    }

    return document;
  });
};
