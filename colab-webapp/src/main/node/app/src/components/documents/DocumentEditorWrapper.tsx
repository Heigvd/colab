/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faLink, faParagraph, faPlus, faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import { useDocuments } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import InlineLoading from '../common/InlineLoading';
import { space_M } from '../styling/style';
import { DocumentContext } from './documentCommonType';
import DocumentCreatorButton from './DocumentCreatorButton';
import { DocumentEditorDisplay } from './DocumentEditorDisplay';

export interface DocumentEditorWrapperProps {
  context: DocumentContext;
  allowEdition?: boolean;
}

export function DocumentEditorWrapper({
  context,
  allowEdition,
}: DocumentEditorWrapperProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { documents, status } = useDocuments(context);

  React.useEffect(() => {
    if (status == 'NOT_INITIALIZED') {
      if (context.kind == 'DeliverableOfCardContent' && context.cardContentId != null) {
        dispatch(API.getDeliverablesOfCardContent(context.cardContentId));
      }
      if (context.kind == 'PartOfResource' && context.resourceId != null) {
        dispatch(API.getDocumentsOfResource(context.resourceId));
      }
    }
  }, [context, status, dispatch]);

  if (status === 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  }

  return (
    <>
      {documents
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(doc => (
          <DocumentEditorDisplay key={doc.id} document={doc} allowEdition={allowEdition} />
        ))}
      <Flex className={css({ paddingTop: space_M })}>
        {allowEdition && (
          <DocumentCreatorButton
            creationContext={context}
            docType="TextDataBlock"
            title="add a text block"
            label={
              <>
                <FontAwesomeIcon icon={faPlus} title="Create a new variant" size='sm' />
                {' '}
                <FontAwesomeIcon icon={faParagraph} title="Create a new variant" />
              </>
            }
          />
        )}
        {allowEdition && (
          <DocumentCreatorButton
            creationContext={context}
            docType="DocumentFile"
            title="add a file"
            label={
              <>
                <FontAwesomeIcon icon={faPlus} title="Create a new variant" size='sm'/>
                {' '}
                <FontAwesomeIcon icon={faFile} title="Create a new variant" />
              </>
            }
          />
        )}
        {allowEdition && (
          <DocumentCreatorButton
            creationContext={context}
            docType="ExternalLink"
            title="add a link"
            label={
              <>
                <FontAwesomeIcon icon={faPlus} title="Create a new variant" size='sm' />
                {' '}
                <FontAwesomeIcon icon={faLink} title="Create a new variant" />
              </>
            }
          />
        )}
      </Flex>
    </>
  );
}
