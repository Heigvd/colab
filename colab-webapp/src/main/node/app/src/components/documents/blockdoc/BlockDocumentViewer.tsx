/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { BlockDocument } from 'colab-rest-client';
import * as React from 'react';

export interface BlockDocProps {
  doc: BlockDocument;
}

export function BLockDocumentViewer({ doc }: BlockDocProps): JSX.Element {
  return (
    <div>
      <div>{doc.title}</div>
      <div>{doc.teaser}</div>
    </div>
  );
}
