/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import logger from '../../../logger';
import OpenGraphLink from '../../common/element/OpenGraphLink';
import { space_S } from '../../styling/style';
import markdownToDom from './parser/markdownToDom';

export const colabFlavouredMarkdown = css({
  'li[data-checked]': {
    marginLeft: '-15px',
  },
  "li[data-checked='TODO']": {
    listStyleType: 'none',
    '::before': {
      content: '"\\2610  "', // \f0c8
      // fontFamily: 'FontAwesome', \\ f0c8
    },
  },
  " li[data-checked='DONE']": {
    listStyleType: 'none',
    '::before': {
      content: '"\\2611  "', // \f14a   \1F5F9
      //fontFamily: 'FontAwesome',  \f14a
    },
  },
  "li[data-list-type='OL']": {
    listStyleType: 'numeric',
  },
  "span[data-type='link']": {
    textDecorationLine: 'underline',
  },
});

export const colabFlavouredMarkdownEditable = css({
  'li[data-checked]::before': {
    cursor: 'pointer',
  },
});

export interface LinkOverlay {
  node: Element;
  href: string;
  editing: boolean;
}

export const computeOverlayPosition = (node: Element) => {
  if (node.isConnected) {
    const { top, left, height } = node.getBoundingClientRect();
    return css({
      position: 'fixed',
      top: top + height,
      left,
      width: '20cm',
    });
  } else {
    return css({ display: 'none' });
  }
};

export interface MarkdownViewerProps {
  md: string;
  className?: string;
}

export default function MarkdownViewer({ md, className }: MarkdownViewerProps): JSX.Element {
  const divRef = React.useRef<HTMLDivElement>(null);
  const i18n = useTranslations();

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

  const [linkOverlay, setLinkOverlay] = React.useState<LinkOverlay | undefined>(undefined);

  const onClick = React.useCallback((event: MouseEvent) => {
    if (event.target instanceof Element) {
      if (event.target.closest('div.linkOverlay')) {
        return;
      }
    }
    setLinkOverlay(undefined);
  }, []);

  React.useEffect(() => {
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, [onClick]);

  const interceptClickCb = React.useCallback((event: React.MouseEvent) => {
    if (event.target instanceof Element) {
      const linkNode = event.target.closest('span[data-type=link');
      if (linkNode) {
        setLinkOverlay({
          editing: false,
          href: linkNode.getAttribute('data-link-href') || '',
          node: linkNode,
        });
      }
    }
  }, []);

  return (
    <div className={cx(css({ p: { margin: space_S + ' 0' } }), colabFlavouredMarkdown, className)}>
      {md === '' ? (
        <p className={css({ color: 'var(--lightGray)' })}>
          <i>{i18n.common.empty}</i>
        </p>
      ) : null}
      <div onClick={interceptClickCb} ref={divRef} />
      {linkOverlay && (
        <div className={'linkOverlay ' + computeOverlayPosition(linkOverlay.node)}>
          <OpenGraphLink
            url={linkOverlay.href}
            readOnly={true}
            setEditingState={() => {
              setLinkOverlay({
                ...linkOverlay,
                editing: !linkOverlay.editing,
              });
            }}
            editingStatus={linkOverlay.editing}
          />
        </div>
      )}
    </div>
  );
}
