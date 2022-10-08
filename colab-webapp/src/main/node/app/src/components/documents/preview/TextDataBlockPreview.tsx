/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { TextDataBlock } from 'colab-rest-client';
import * as React from 'react';
import MarkdownViewer from '../../blocks/markdown/MarkdownViewer';

export interface TextDataBlockPreviewProps {
  block: TextDataBlock;
  className?: string;
}

export default function TextDataBlockPreview({ block }: TextDataBlockPreviewProps): JSX.Element {
  switch (block.mimeType) {
    case 'text/markdown':
      return <MarkdownViewer md={block.textData || ''} showEmptiness={false} />;
    default:
      return <>{block.textData}</>;
  }
}
