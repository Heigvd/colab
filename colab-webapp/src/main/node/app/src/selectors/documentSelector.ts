/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document, entityIs } from 'colab-rest-client';
import * as API from '../API/api';
import { DocumentContext } from '../components/documents/documentCommonType';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { AvailabilityStatus } from '../store/store';

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch a text from a text data block
////////////////////////////////////////////////////////////////////////////////////////////////////

/** text + availability status */
type TextAndStatus = {
  text: string | null | undefined;
  status: AvailabilityStatus;
};

/** fetch the text / availability status */
const useTextDataBlock = (id: number | null | undefined): TextAndStatus => {
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

/** fetch (and load if needed) the text / availability status */
export const useAndLoadTextDataBlock = (id: number | null | undefined): TextAndStatus => {
  const dispatch = useAppDispatch();

  const { text, status } = useTextDataBlock(id);

  if (status === 'NOT_INITIALIZED' && id) {
    // we have to ask data to the server
    dispatch(API.getDocument(id));
  }

  return { text, status };
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch all the documents of a card content / resource
////////////////////////////////////////////////////////////////////////////////////////////////////

/** matching documents + availability status */
type DocsAndStatus = {
  documents: Document[];
  status: AvailabilityStatus;
};

/** fetch the matching documents / availability status */
const useDocuments = ({ kind, ownerId }: DocumentContext): DocsAndStatus => {
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

/** fetch (and load if needed) the matching documents / availability status */
export const useAndLoadDocuments = (context: DocumentContext): DocsAndStatus => {
  const dispatch = useAppDispatch();

  const { documents, status } = useDocuments(context);

  if (status === 'NOT_INITIALIZED' && context.ownerId) {
    if (context.kind === 'DeliverableOfCardContent') {
      dispatch(API.getDeliverablesOfCardContent(context.ownerId));
    } else if (context.kind === 'PartOfResource') {
      dispatch(API.getDocumentsOfResource(context.ownerId));
    }
  }

  return { documents, status };
};
