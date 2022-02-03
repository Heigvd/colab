/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import { DocumentFileEditor } from './DocumentFileEditor';
import { ExternalLinkEditor } from './ExternalLinkEditor';

export interface DocumentEditorDisplayProps {
  document: Document;
  allowEdition?: boolean;
}

export function DocumentEditorDisplay({
  document,
  allowEdition = true,
}: DocumentEditorDisplayProps): JSX.Element {
  if (entityIs(document, 'TextDataBlock')) {
    return <BlockEditorWrapper blockId={document.id!} allowEdition={allowEdition} />;
  } else if (entityIs(document, 'DocumentFile')) {
    return <DocumentFileEditor document={document} allowEdition={allowEdition} />;
  } else if (entityIs(document, 'ExternalLink')) {
    return <ExternalLinkEditor document={document} allowEdition={allowEdition} />;
  } else {
    return (
      <div>
        <i>Unknown document</i>{' '}
      </div>
    );
  }
}
