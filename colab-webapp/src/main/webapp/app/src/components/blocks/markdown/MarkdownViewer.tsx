/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';

import { Viewer } from '@toast-ui/react-editor';
import logger from '../../../logger';

export interface MarkdownViewerProps {
  md: string;
}

export default function MarkdownViewer({ md }: MarkdownViewerProps): JSX.Element {
  const viewerRef = React.createRef<Viewer>();

  React.useEffect(() => {
    if (viewerRef.current != null) {
      viewerRef.current.getInstance().setMarkdown(md);
    } else {
      logger.error('Viewer ref is null');
    }
  }, [md, viewerRef]);

  return <Viewer ref={viewerRef} initialValue={md} />;
}
