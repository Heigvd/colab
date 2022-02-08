/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {css, cx} from '@emotion/css';
import * as React from 'react';
import logger from '../../../logger';
import {space_S} from '../../styling/style';
import markdownToDom from './parser/markdownToDom';


export const colabFlavouredMarkdown = css({
  "li[data-checked='TODO']": {
    listStyleType: 'none',
    "::before": {
      content: '"\\2610  "', // \f0c8
      // fontFamily: 'FontAwesome', \\ f0c8
    }
  },
  " li[data-checked='DONE']": {
    listStyleType: 'none',
    "::before": {
      content: '"\\1F5F9  "', // \f14a
      //fontFamily: 'FontAwesome',  \f14a
    }
  },
});

export interface MarkdownViewerProps {
  md: string;
  className?: string;
}

export default function MarkdownViewer({md, className}: MarkdownViewerProps): JSX.Element {
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
    <div className={cx(css({p: {margin: space_S + ' 0'}}), colabFlavouredMarkdown, className)}>
      {md === '' ? (
        <p className={css({color: 'var(--lightGray)'})}>
          <i>empty</i>
        </p>
      ) : null}
      <div ref={divRef} />
    </div>
  );
}
