/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faFile, faLink, faParagraph, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useAndLoadDocuments } from '../../selectors/documentSelector';
import AvailabilityStatusIndicator from '../common/AvailabilityStatusIndicator';
import Flex from '../common/Flex';
import { space_M } from '../styling/style';
import { DocumentContext } from './documentCommonType';
import DocumentCreatorButton from './DocumentCreatorButton';
import DocumentEditor from './DocumentEditor';

export interface DocumentListProps {
  context: DocumentContext;
  allowEdition?: boolean;
}

export default function DocumentList({ context, allowEdition }: DocumentListProps): JSX.Element {
  const { documents, status } = useAndLoadDocuments(context);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      {documents
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(doc => (
          <DocumentEditor key={doc.id} document={doc} allowEdition={allowEdition || true} />
        ))}
      {allowEdition && (
        <Flex className={css({ paddingTop: space_M })}>
          <DocumentCreatorButton
            context={context}
            docKind="TextDataBlock"
            title="add a text block"
            label={
              <>
                <FontAwesomeIcon icon={faPlus} size="sm" /> <FontAwesomeIcon icon={faParagraph} />
              </>
            }
          />
          <DocumentCreatorButton
            context={context}
            docKind="DocumentFile"
            title="add a file"
            label={
              <>
                <FontAwesomeIcon icon={faPlus} size="sm" /> <FontAwesomeIcon icon={faFile} />
              </>
            }
          />
          <DocumentCreatorButton
            context={context}
            docKind="ExternalLink"
            title="add a link"
            label={
              <>
                <FontAwesomeIcon icon={faPlus} size="sm" /> <FontAwesomeIcon icon={faLink} />
              </>
            }
          />
        </Flex>
      )}
    </>
  );
}
