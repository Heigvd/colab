/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import * as React from 'react';
import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const modalOverlayStyle = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'fixed',
  flexDirection: 'column',
  top: '0px',
  bottom: '0px',
  left: '0px',
  right: '0px',
  backgroundColor: 'rgba(40, 40, 40, 0.6)',
  flexGrow: '0px',
  flexShrink: '1px',
  zIndex: '100',
});
const modalStyle = css({
  padding: '20px',
  minHeight: '100px',
  minWidth: '300px',
  display: 'flex',
  flexGrow: '0px',
  backgroundColor: '#fff',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: '0 0 20px 0 #444',
  borderRadius: '10px',
});
const modalTitleStyle = css({
  color: '#444',
  margin: '0px',
  paddingBottom: '10px',
  borderBottom: '1px solid #ccc',
});
const modalCloseButtonStyle = css({
  border: '0px',
  position: 'absolute',
  right: '20px',
  borderRadius: '20px',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  width: '30px',
  height: '30px',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: '#eee',
  '&:hover': {
    backgroundClip: '#ddd',
  },
});
const modalContentStyle = css({
  paddingTop: '20px',
});

function PortalImpl({
  onClose,
  children,
  title,
  closeOnClickOutside,
}: {
  children: ReactNode;
  closeOnClickOutside: boolean;
  onClose: () => void;
  title: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current !== null) {
      modalRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;
    const handler = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        modalRef.current !== null &&
        !modalRef.current.contains(target as Node) &&
        closeOnClickOutside
      ) {
        onClose();
      }
    };
    const modelElement = modalRef.current;
    if (modelElement !== null) {
      modalOverlayElement = modelElement.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement.addEventListener('click', clickOutsideHandler);
      }
    }

    window.addEventListener('keydown', handler);

    return () => {
      window.removeEventListener('keydown', handler);
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener('click', clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onClose]);

  return (
    <div className={modalOverlayStyle} role="dialog">
      <div className={modalStyle} tabIndex={-1} ref={modalRef}>
        <h2 className={modalTitleStyle}>{title}</h2>
        <button
          className={modalCloseButtonStyle}
          aria-label="Close modal"
          type="button"
          onClick={onClose}
        >
          X
        </button>
        <div className={modalContentStyle}>{children}</div>
      </div>
    </div>
  );
}

export default function Modal({
  onClose,
  children,
  title,
  closeOnClickOutside = false,
}: {
  children: ReactNode;
  closeOnClickOutside?: boolean;
  onClose: () => void;
  title: string;
}): JSX.Element {
  return createPortal(
    <PortalImpl onClose={onClose} title={title} closeOnClickOutside={closeOnClickOutside}>
      {children}
    </PortalImpl>,
    document.body,
  );
}
