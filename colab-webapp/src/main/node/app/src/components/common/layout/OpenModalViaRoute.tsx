/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { linkStyle } from '../../../styling/style';
import Modal from './Modal';

// not used for now

interface OpenModalViaRouteProps {
  collapsedChildren: React.ReactNode;
  route: string;
  title: React.ReactNode;
  showCloseButton?: boolean;
  children: (collapse: () => void) => React.ReactNode;
}

export default function OpenModalViaRoute({
  collapsedChildren,
  route,
  title,
  showCloseButton = false,
  children,
}: OpenModalViaRouteProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  //const match = useRouteMatch();

  const onClose = React.useCallback(() => {
    if (route != null) {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    }
  }, [navigate, location, route]);

  return (
    <Routes>
      <Route
        path={route}
        element={
          <>
            {collapsedChildren}
            <Modal title={title} showCloseButton={showCloseButton} onClose={onClose}>
              {onCloseModal => children(onCloseModal)}
            </Modal>
          </>
        }
      />
      <Route
        path="*"
        element={
          <NavLink
            className={cx(
              linkStyle,
              css({
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'none',
                },
              }),
            )}
            to={route}
          >
            {collapsedChildren}
          </NavLink>
        }
      />
    </Routes>
  );
}
