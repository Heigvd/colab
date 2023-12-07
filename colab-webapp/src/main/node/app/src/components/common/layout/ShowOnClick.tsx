/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';

const relative = css({
  position: 'relative',
});

interface ShowOnClickProps {
  status?: 'COLLAPSED' | 'EXPANDED';
  showCollapsedChildrenWhenOpened?: boolean;
  collapsedChildren: React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
  className?: string;
}

export default function ShowOnClick({
  status = 'COLLAPSED',
  showCollapsedChildrenWhenOpened,
  collapsedChildren,
  children: expandedChildren,
  className,
}: ShowOnClickProps): JSX.Element {
  const [state, setState] = React.useState<'COLLAPSED' | 'EXPANDED'>(status || 'COLLAPSED');

  const collapse = React.useCallback(() => {
    setState('COLLAPSED');
  }, []);

  React.useEffect(() => {
    setState(status);
  }, [status]);

  if (state === 'COLLAPSED') {
    return (
      <div
        className={className}
        onClick={e => {
          e.stopPropagation();
          setState('EXPANDED');
        }}
      >
        {collapsedChildren}
      </div>
    );
  } else {
    return (
      <div className={cx(relative, className)}>
        {showCollapsedChildrenWhenOpened && collapsedChildren}
        {expandedChildren(collapse)}
      </div>
    );
  }
}
