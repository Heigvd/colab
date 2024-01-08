/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { assertUnreachable } from '../../../helper';
import OpenGraphLink from '../../common/element/OpenGraphLink';
import DocumentFileEditor from '../DocumentFileEditor';
import TextDataBlockPreview from './TextDataBlockPreview';

export interface PreviewProps {
  doc: Document;
  filter?: string[]; // filter by block tag, once #80
}

const noOp = () => {};

export default function Preview({ doc }: PreviewProps): JSX.Element {
  if (entityIs(doc, 'TextDataBlock')) {
    return <TextDataBlockPreview block={doc} />;
  } else if (entityIs(doc, 'DocumentFile')) {
    return (
      <DocumentFileEditor
        document={doc}
        readOnly={true}
        editingStatus={false}
        setEditingState={noOp}
      />
    );
  } else if (entityIs(doc, 'ExternalLink')) {
    return (
      <OpenGraphLink
        url={doc.url || ''}
        editingStatus={false}
        readOnly={true}
        setEditingState={noOp}
      />
    );
  } else {
    assertUnreachable(doc);
    return <></>;
  }
}
