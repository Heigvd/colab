/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAndLoadDocuments } from '../../selectors/documentSelector';
import AvailabilityStatusIndicator from '../common/AvailabilityStatusIndicator';
import { DocumentOwnership } from './documentCommonType';
import DocumentEditor from './DocumentEditor';

export interface DocumentListProps {
  docOwnership: DocumentOwnership;
  allowEdition?: boolean;
}

export default function DocumentList({
  docOwnership,
  allowEdition,
}: DocumentListProps): JSX.Element {
  const { documents, status } = useAndLoadDocuments(docOwnership);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      {documents
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(doc => (
          <DocumentEditor
            key={doc.id}
            doc={doc}
            allowEdition={allowEdition}
            docOwnership={docOwnership}
          />
        ))}
    </>
  );
}
