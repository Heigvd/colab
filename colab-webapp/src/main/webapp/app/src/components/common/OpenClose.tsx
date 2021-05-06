/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { faPenNib, faTimes } from '@fortawesome/free-solid-svg-icons';
import IconButton from './IconButton';

type State = {
  status: 'COLLAPSED' | 'EXPANDED';
};

export interface Props {
  collaspedChildren: JSX.Element;
  children: JSX.Element;
}

export default function OpenClose({ collaspedChildren, children }: Props): JSX.Element {
  const [state, setState] = React.useState<State>({
    status: 'COLLAPSED',
  });

  if (state.status === 'EXPANDED') {
    return (
      <>
        {children}
        <IconButton
          icon={faTimes}
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
        {collaspedChildren}
        <IconButton
          icon={faPenNib}
          title="edit"
          onClick={() => {
            setState({
              status: 'EXPANDED',
            });
          }}
        />
      </div>
    );
  }
}
