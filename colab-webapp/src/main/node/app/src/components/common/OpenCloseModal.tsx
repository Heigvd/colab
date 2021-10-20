/**
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013-2021 School of Management and Engineering Vaud, Comem, MEI
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { NavLink, Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { linkStyle } from '../styling/style';
import Modal from './Modal';
import OpenClose from './OpenClose';

interface Props {
  title: string;
  className?: string;
  collapsedChildren: React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
  showCloseButton?: boolean;
  illustration?: string;
  route?: string;
}

export const defaultIconClassName = css({
  width: '28px',
  display: 'inline-block',
  textAlign: 'center',
});

export const modalPadding = '25px';

export default function OpenCloseModal({
  className,
  collapsedChildren,
  title,
  children,
  route,
  showCloseButton = false,
  illustration = 'ICON_black-blue_cogs_fa',
}: Props): JSX.Element {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch();

  const onClose = React.useCallback(() => {
    match;
    if (route != null) {
      history.push(match.url);
    }
  }, [history, route, match]);

  if (route != null) {
    return (
      <Switch>
        <Route path={`${match.path}${route}`}>
          {collapsedChildren}
          {location.pathname.startsWith(`${match.path}${route}`) ? (
            <Modal
              title={title}
              illustration={illustration}
              onClose={onClose}
              showCloseButton={showCloseButton}
            >
              {onCloseModal => children(onCloseModal)}
            </Modal>
          ) : null}
        </Route>
        <Route>
          <NavLink className={linkStyle} to={`${match.url}${route}`}>
            {collapsedChildren}
          </NavLink>
        </Route>
      </Switch>
    );
  } else {
    return (
      <OpenClose
        className={className}
        collapsedChildren={collapsedChildren}
        showCloseIcon="KEEP_CHILD"
      >
        {onClose => (
          <Modal
            title={title}
            illustration={illustration}
            onClose={onClose}
            showCloseButton={showCloseButton}
          >
            {onCloseModal => children(onCloseModal)}
          </Modal>
        )}
      </OpenClose>
    );
  }
}
