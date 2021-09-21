/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { BlockDocumentEditor } from './blockdoc/BlockDocumentEditor';

export interface DocumentEditorDisplayProps {
  document: Document;
}

export function DocumentEditorDisplay({ document }: DocumentEditorDisplayProps): JSX.Element {
  if (entityIs(document, 'BlockDocument')) {
    return <BlockDocumentEditor doc={document} />;
  } else if (entityIs(document, 'HostedDocLink')) {
    return (
      <div>
        {' '}
        <i>HostedDocLink not yet implemented (upload new document)</i>{' '}
      </div>
    );
  } else if (entityIs(document, 'ExternalDocLink')) {
    return (
      <div>
        {' '}
        <i>ExternalDocLink not yet implemented (url thumbnail, url editor)</i>{' '}
      </div>
    );
  } else {
    return (
      <div>
        <i>Unknown document</i>{' '}
      </div>
    );
  }
}
