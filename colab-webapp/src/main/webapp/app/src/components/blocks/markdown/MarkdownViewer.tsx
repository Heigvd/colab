/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import '@toast-ui/editor/dist/toastui-editor.css';
import { Viewer } from '@toast-ui/react-editor';
import * as React from 'react';
import { logger } from '../../../logger';

export interface MarkdownViewerProps {
  md: string;
  className?: string;
}

export default function MarkdownViewer({ md, className }: MarkdownViewerProps): JSX.Element {
  const viewerRef = React.useRef<{ viewer?: Viewer }>({});

  React.useEffect(() => {
    if (viewerRef.current != null && viewerRef.current.viewer) {
      viewerRef.current.viewer.getInstance().setMarkdown(md);
    } else {
      logger.error('Viewer ref is null');
    }
  }, [md, viewerRef]);

  return (
    <div className={className}>
      {md === '' ? <i>empty</i> : null}
      <Viewer
        ref={ref => {
          if (ref != null) {
            viewerRef.current.viewer = ref;
          } else {
            delete viewerRef.current.viewer;
          }
        }}
        initialValue={md}
      />
    </div>
  );
}
