/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import Clickable from './Clickable';
import IconButton from './IconButton';

type State = {
  status: 'COLLAPSED' | 'EXPANDED';
};

export interface Props {
  closeIcon?: IconProp;
  collaspedChildren: JSX.Element;
  children: (collapse: () => void) => JSX.Element;
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
  collaspedChildren,
  children,
  closeIcon = faTimes,
}: Props): JSX.Element {
  const [state, setState] = React.useState<State>({
    status: 'COLLAPSED',
  });

  const collapse = React.useCallback(() => {
    setState({ status: 'COLLAPSED' });
  }, []);

  if (state.status === 'EXPANDED') {
    return (
      <div className={relative}>
        {children(collapse)}
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
      </div>
    );
  } else {
    return (
      <div>
        <Clickable
          onClick={() => {
            setState({
              status: 'EXPANDED',
            });
          }}
        >
          {collaspedChildren}
        </Clickable>
      </div>
    );
  }
}
