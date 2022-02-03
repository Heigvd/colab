/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document, entityIs, TextDataBlock } from 'colab-rest-client';
import { useAppSelector } from '../store/hooks';
import { LoadingStatus } from '../store/store';


// export const useDocument = (
//   id: number | null | undefined,
// ): Document | LoadingStatus | undefined => {
//   return useAppSelector(state => {
//     if (id != null) {
//       const docDetail = state.document.documents[id];

//       if (docDetail === null) {
//         return 'LOADING';
//       } else {
//         return docDetail;
//       }
//     }
//     return undefined;
//   }); // refEqual is fine
// };

export const useTextDataBlock = (
  docId: number | null | undefined
): {
  block: TextDataBlock | null | undefined;
  status: LoadingStatus;
} => {
  return useAppSelector(state => {
    if (docId != null) {
      const doc = state.document.documents[docId];

      if (doc === undefined) {
        return { block: doc, status: 'NOT_INITIALIZED' };
      }

      if (doc === null) {
        return { block: doc, status: 'LOADING' };
      }

      if (entityIs(doc, 'TextDataBlock')) {
        return { block: doc, status: 'READY' }
      }
    }
    
    return { block: undefined, status: 'NOT_INITIALIZED' };
  });
};

export const useDeliverables = (
  cardContentId: number | null | undefined
): {
  documents: Document[];
  status: LoadingStatus
} => {
  return useAppSelector(state => {
    if (cardContentId != null) {
      const dataInStore = state.document.byCardContent[cardContentId];

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
              return (doc && entityIs(doc, 'Document')) ? [doc] : [];
            }),
            status: 'READY',
          };
        }
      }
    }

    return { documents: [], status: 'NOT_INITIALIZED' };
  });
};

export const useDocumentsOfResource = (
  resourceId: number | null | undefined
): {
  documents: Document[];
  status: LoadingStatus;
} => {
  return useAppSelector(state => {
    if (resourceId != null) {
      const dataInStore = state.document.byResource[resourceId];

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
              return (doc && entityIs(doc, 'Document')) ? [doc] : [];
            }),
            status: 'READY',
          };
        }
      }
    }

    return { documents: [], status: 'NOT_INITIALIZED' };
  });
}
