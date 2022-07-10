/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import Clickable from '../Clickable';
import IconButton from '../IconButton';

/*  type State = {
  status: 'COLLAPSED' | 'EXPANDED';
}; */

export interface Props {
  className?: string;
  closeIcon?: IconProp;
  showCloseIcon?: 'ICON' | 'NONE' | 'KEEP_CHILD';
  collapsedChildren: React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
  status?: 'COLLAPSED' | 'EXPANDED';
}

const relative = css({
  position: 'relative',
});

const topRightAbs = css({
  position: 'absolute',
  top: 0,
  right: 0,
});

export default function OpenClose({
  className,
  collapsedChildren,
  children,
  closeIcon = faTimes,
  showCloseIcon = 'ICON',
  status = 'COLLAPSED',
}: Props): JSX.Element {
  const [state, setState] = React.useState({
    status: status || 'COLLAPSED',
  });

  const collapse = React.useCallback(() => {
    setState({ status: 'COLLAPSED' });
  }, []);

  if (state.status === 'EXPANDED') {
    return (
      <div className={cx(relative, className)}>
        {showCloseIcon == 'KEEP_CHILD' ? collapsedChildren : null}
        {children(collapse)}
        {showCloseIcon == 'ICON' ? (
          <IconButton
            className={topRightAbs}
            icon={closeIcon}
            title="close"
            onClick={() => {
              setState({
                status: 'COLLAPSED',
              });
            }}
          />
        ) : null}
      </div>
    );
  } else {
    return (
      <Clickable
        className={className}
        clickableClassName={className}
        onClick={e => {
          e.stopPropagation();
          setState({
            status: 'EXPANDED',
          });
        }}
      >
        {collapsedChildren}
      </Clickable>
    );
  }
}
