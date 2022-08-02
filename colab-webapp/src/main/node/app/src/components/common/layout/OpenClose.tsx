/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import IconButton from '../element/IconButton';
import Clickable from './Clickable';

const relative = css({
  position: 'relative',
});

const topRightAbs = css({
  position: 'absolute',
  top: 0,
  right: 0,
});

interface OpenCloseProps {
  status?: 'COLLAPSED' | 'EXPANDED';
  showCloseIcon?: boolean;
  showCollapsedChildrenWhenOpened?: boolean;
  collapsedChildren: React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
  className?: string;
}

export default function OpenClose({
  status = 'COLLAPSED',
  showCloseIcon,
  showCollapsedChildrenWhenOpened,
  collapsedChildren,
  children,
  className,
}: OpenCloseProps): JSX.Element {
  const i18n = useTranslations();

  const [state, setState] = React.useState<'COLLAPSED' | 'EXPANDED'>(status || 'COLLAPSED');



  const collapse = React.useCallback(() => {
    setState('COLLAPSED');
  }, []);

    React.useEffect(() => {
    setState(status);
  }, [status]); 

  if (state === 'COLLAPSED') {
    return (
      <Clickable
        clickableClassName={className}
        onClick={e => {
          e.stopPropagation();
          setState('EXPANDED');
        }}
      >
        {collapsedChildren}
      </Clickable>
    );
  } else {
    return (
      <div className={cx(relative, className)}>
        {showCollapsedChildrenWhenOpened && collapsedChildren}
        {children(collapse)}
        {showCloseIcon && (
          <IconButton
            icon={faTimes}
            title={i18n.common.close}
            className={topRightAbs}
            onClick={() => {
              setState('COLLAPSED');
            }}
          />
        )}
      </div>
    );
  }
}
