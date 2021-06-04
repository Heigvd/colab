/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import IconButton from './IconButton';
import {IconProp} from '@fortawesome/fontawesome-svg-core';
import Clickable from './Clickable';

type State = {
  status: 'COLLAPSED' | 'EXPANDED';
};

export interface Props {
  closeIcon?: IconProp;
  collaspedChildren: JSX.Element;
  children: JSX.Element;
}

export default function OpenClose({
  collaspedChildren,
  children,
  closeIcon = faTimes,
}: Props): JSX.Element {
  const [state, setState] = React.useState<State>({
    status: 'COLLAPSED',
  });

  if (state.status === 'EXPANDED') {
    return (
      <>
        {children}
        <IconButton
          icon={closeIcon}
          title="close"
          onClick={() => {
            setState({
              status: 'COLLAPSED',
            });
          }}
        />
      </>
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
