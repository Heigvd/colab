/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { DocumentOwnership } from '../../components/documents/documentCommonType';
import { useAppDispatch, useAppSelector } from '../hooks';
import { AvailabilityStatus, ColabState } from '../store';

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch a text from a text data block
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * text + availability status
 */
export type TextAndStatus = {
  text: string | null | undefined;
  status: AvailabilityStatus;
};

/**
 * fetch the text
 *
 * @param id the id of the text data block document containing the text
 * @returns the text (if found) + the availability status
 */
const useTextOfDocument = (id: number | null | undefined): TextAndStatus => {
  return useAppSelector(state => {
    const defaultResult = { text: undefined };

    if (id) {
      const dataInStore = state.document.documents[id];

      if (dataInStore === undefined) {
        // nothing in store
        return { ...defaultResult, status: 'NOT_INITIALIZED' };
      } else if (typeof dataInStore === 'string') {
        // we got an availability status
        return { ...defaultResult, status: dataInStore };
      } else if (entityIs(dataInStore, 'TextDataBlock')) {
        // great. we got the data
        return { text: dataInStore.textData, status: 'READY' };
      }
    }

    // something went wrong
    return { ...defaultResult, status: 'ERROR' };
  });
};

/**
 * fetch and load (if needed) the text
 *
 * @param id the id of the text data block document containing the text
 * @returns the text (if found) + the availability status
 */
export const useAndLoadTextOfDocument = (id: number | null | undefined): TextAndStatus => {
  const dispatch = useAppDispatch();

  const { text, status } = useTextOfDocument(id);
  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && id) {
      // we have to ask data to the server
      dispatch(API.getDocument(id));
    }
  }, [dispatch, id, status]);

  return { text, status };
};

// TODO sandra work in progress load all purposes in one call
export const useAndLoadAllTextOfDocument = (/*cardTypes: CardType[]*/): TextAndStatus[] => {
  // return useAppSelector(state => {
  //   const idTextNeeded = cardTypes.flatMap(ct => (ct.purposeId ? [ct.purposeId] : []));

  //   const idTextMissing = idTextNeeded.filter(
  //     idTxt => state.document.documents[idTxt] === undefined,
  //   );

  //   dispatch(API.getSeveralDocuments(idTextMissing);)

  // return useAppSelector(state => {
  const defaultResult = { text: undefined };
  return [{ ...defaultResult, status: 'ERROR' }];
  // });
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch all the documents of a card content / resource
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * matching documents + availability status
 */
type DocsAndStatus = {
  documents: Document[];
  status: AvailabilityStatus;
};

/**
 * fetch the matching documents
 *
 * @param context all needed data to know what to fetch
 * @returns the matching documents (if found) + the availability status
 */
const useDocuments = ({ kind, ownerId }: DocumentOwnership): DocsAndStatus => {
  return useAppSelector(state => {
    const defaultResult = { documents: [] };

    if (ownerId) {
      let status;
      if (kind === 'DeliverableOfCardContent') {
        status = state.document.statusByCardContent[ownerId];
      } else if (kind === 'PartOfResource') {
        status = state.document.statusByResource[ownerId];
      } else {
        // cannot go there (except if we add another kind)
        return { ...defaultResult, status: 'ERROR' };
      }

      if (status === undefined) {
        // nothing in store
        return { ...defaultResult, status: 'NOT_INITIALIZED' };
      } else if (status !== 'READY') {
        // we got an availability status
        return { ...defaultResult, status: status };
      } else {
        // great. we can get the data
        let documents;
        if (kind === 'DeliverableOfCardContent') {
          documents = Object.values(state.document.documents).flatMap(doc =>
            entityIs(doc, 'Document') && doc.owningCardContentId === ownerId ? [doc] : [],
          );
        } else {
          documents = Object.values(state.document.documents).flatMap(doc =>
            entityIs(doc, 'Document') && doc.owningResourceId === ownerId ? [doc] : [],
          );
        }

        return { documents, status: status };
      }
    }

    // something went wrong
    return { ...defaultResult, status: 'ERROR' };
  });
};

/**
 * fetch (and load if needed) the matching documents
 *
 * @param context all needed data to know what to fetch
 * @returns the matching documents (if found) + the availability status
 */
export const useAndLoadDocuments = (context: DocumentOwnership): DocsAndStatus => {
  const dispatch = useAppDispatch();

  const { documents, status } = useDocuments(context);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && context.ownerId) {
      if (context.kind === 'DeliverableOfCardContent') {
        dispatch(API.getDeliverablesOfCardContent(context.ownerId));
      } else if (context.kind === 'PartOfResource') {
        dispatch(API.getDocumentsOfResource(context.ownerId));
      }
    }
  }, [context.kind, context.ownerId, dispatch, status]);

  return { documents, status };
};

/**
 * fetch (and load if needed) the number of matching documents
 *
 * @param context all needed data to know what to fetch
 * @returns the number of matching documents (if found) + the availability status
 */
export const useAndLoadNbDocuments = (
  context: DocumentOwnership,
): { nb: number; status: AvailabilityStatus } => {
  // no optimization here, as (for the time being)
  // we always have the documents already loaded when we call that
  const { documents, status }: DocsAndStatus = useAndLoadDocuments(context);

  return { nb: documents.length, status };
};

// /**
//  * fetch (and load if needed) the matching documents and see if there is any not empty doc
//  *
//  * @param context all needed data to know what to fetch
//  * @returns true if only empty docs + the availability status
//  */
// export const useAndLoadIfOnlyEmptyDocuments = (
//   context: DocumentOwnership,
// ): { empty: boolean; status: AvailabilityStatus } => {
//   // no optimization here, as (for the time being)
//   // we always have the documents already loaded when we call that
//   const { documents, status }: DocsAndStatus = useAndLoadDocuments(context);

//   return {
//     empty:
//       documents.filter(doc => !entityIs(doc, 'TextDataBlock') || (doc.textData?.length || 0) > 0)
//         .length < 1,
//     status,
//   };
// };

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

const selectDocuments = (state: ColabState) => state.document.documents;

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch 1 document
////////////////////////////////////////////////////////////////////////////////////////////////////

// interface DocumentAndStatus {
//   status: AvailabilityStatus;
//   document?: Document;
// }

export function selectDocument(
  state: ColabState,
  documentId: number,
): Document | AvailabilityStatus | undefined {
  return selectDocuments(state)[documentId];
}

// export function useDocument(id: number): DocumentAndStatus {
//   const { status, data } = useFetchById<Document>(id, selectDocuments, API.getDocument);
//   return { status, document: data };
// }
