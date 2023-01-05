/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAndLoadDocuments } from '../../../selectors/documentSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import { DocumentOwnership } from '../documentCommonType';
import Preview from './Preview';

export interface DocumentPreviewProps {
  className?: string;
  docOwnership: DocumentOwnership;
}

export default function DocumentPreview({
  docOwnership,
  className,
}: DocumentPreviewProps): JSX.Element {
  const { documents, status } = useAndLoadDocuments(docOwnership);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  if (documents.length > 0) {
    return (
      <div className={className}>
        {documents.length > 0 &&
          documents
            .sort((a, b) => (a.index || 0) - (b.index || 0))
            .map(doc => <Preview key={doc.id} doc={doc} />)}
      </div>
    );
  } else {
    return <></>;
  }
}
