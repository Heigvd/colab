/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import logger from '../../../logger';
import markdownToDom from './parser/markdownToDom';

export interface MarkdownViewerProps {
  md: string;
  className?: string;
}

export default function MarkdownViewer({ md, className }: MarkdownViewerProps): JSX.Element {
  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // TODO: Maybe useLayoutEffect ?
    const div = divRef.current;
    if (div != null) {
      // empty div
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
      const dom = markdownToDom(md);
      dom.nodes.forEach(node => div.append(node));
    } else {
      logger.error('Div ref is null');
    }
  }, [md]);

  return (
    <div className={className}>
      {md === '' ? <i>empty</i> : null}
      <div ref={divRef} />
    </div>
  );
}
