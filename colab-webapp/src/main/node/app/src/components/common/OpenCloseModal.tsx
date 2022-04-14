/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { linkStyle, space_M } from '../styling/style';
import Modal from './Modal';
import OpenClose from './OpenClose';

interface Props {
  title: string;
  className?: string;
  collapsedChildren: React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
  footer?: (collapse: () => void) => React.ReactNode;
  showCloseButton?: boolean;
  route?: string;
  status?: 'COLLAPSED' | 'EXPANDED';
  modalClassName?: string;
}

export const defaultIconClassName = css({
  width: '28px',
  display: 'inline-block',
  textAlign: 'center',
});

export const modalPadding = space_M;

export default function OpenCloseModal({
  className,
  collapsedChildren,
  title,
  children,
  footer,
  route,
  showCloseButton = false,
  status = 'COLLAPSED',
  modalClassName,
}: Props): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  //const match = useRouteMatch();

  const onClose = React.useCallback(() => {
    if (route != null) {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    }
  }, [navigate, location, route]);

  if (route != null) {
    return (
      <Routes>
        <Route
          path={route}
          element={
            <>
              {collapsedChildren}
              <Modal title={title} onClose={onClose} showCloseButton={showCloseButton}>
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
  } else {
    return (
      <OpenClose
        className={className}
        collapsedChildren={collapsedChildren}
        showCloseIcon="KEEP_CHILD"
        status={status}
      >
        {onClose => (
          <Modal
            title={title}
            onClose={onClose}
            showCloseButton={showCloseButton}
            className={modalClassName}
            footer={footer}
          >
            {onCloseModal => children(onCloseModal)}
          </Modal>
        )}
      </OpenClose>
    );
  }
}