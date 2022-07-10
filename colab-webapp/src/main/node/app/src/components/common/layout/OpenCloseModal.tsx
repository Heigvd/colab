/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { linkStyle, space_M } from '../../styling/style';
import Modal from './Modal';
import OpenClose from './OpenClose';

interface OpenCloseModalProps {
  title: React.ReactNode;
  className?: string;
  collapsedChildren: React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
  footer?: (collapse: () => void) => React.ReactNode;
  showCloseButton?: boolean;
  route?: string;
  status?: 'COLLAPSED' | 'EXPANDED';
  modalClassName?: string;
  modalBodyClassName?: string;
  widthMax?: boolean;
  heightMax?: boolean;
  onEnter?: (collapse: () => void) => void;
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
  modalBodyClassName,
  widthMax,
  heightMax,
  onEnter,
}: OpenCloseModalProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  //const match = useRouteMatch();

  const onClose = React.useCallback(() => {
    if (route != null) {
      navigate(location.pathname.replace(new RegExp(route + '$'), ''));
    }
  }, [navigate, location, route]);

  /* const handleEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if(onEnter){
        onEnter(() => onClose());
      }     
     }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleEnter, true);
    return () => {
      document.removeEventListener('keydown', handleEnter, true);
    };
  }); */

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
        status={status}
        showCollapsedChildrenWhenOpened
        collapsedChildren={collapsedChildren}
        className={className}
      >
        {onClose => (
          <Modal
            title={title}
            onClose={onClose}
            showCloseButton={showCloseButton}
            className={cx(
              modalClassName,
              widthMax && css({ width: '800px' }, heightMax && css({ height: '580px' })),
            )}
            modalBodyClassName={modalBodyClassName}
            footer={footer}
            onEnter={onEnter}
          >
            {onCloseModal => children(onCloseModal)}
          </Modal>
        )}
      </OpenClose>
    );
  }
}
