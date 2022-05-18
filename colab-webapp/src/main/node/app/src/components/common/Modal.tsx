/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { cardStyle, lightIconButtonStyle, space_L, space_M, space_S } from '../styling/style';
import Flex from './Flex';
import IconButton from './IconButton';
import Overlay from './Overlay';

interface Props {
  title: React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
  footer?: (collapse: () => void) => React.ReactNode;
  showCloseButton?: boolean;
  onClose: () => void;
  className?: string;
  modalBodyClassName?: string;
}
const backgroundStyle = css({
  backgroundColor: 'rgba(0,0,0, 0.6)',
});

const modalStyle = cx(
  cardStyle,
  css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '800px',
    maxHeight: '580px',
    minWidth: '400px',
    minHeight: '200px',
    boxShadow: '0 3px 6px rgba(0,0,0,.16)',
    borderRadius: '8px',
  }),
);

export const modalSeparatorBorder = 'solid 1px var(--lightGray)';

const modalHeader = css({
  display: 'flex',
  alignItems: 'center',
  borderBottom: modalSeparatorBorder,
  padding: space_S + ' ' + space_M,
});

const titleStyle = css({
  fontSize: '24px',
  fontWeight: 200,
});

const closeIconStyle = css({
  width: '64px',
  textAlign: 'right',
  padding: 0,
});

const modalBody = css({
  padding: space_L,
});
const modalFooter = css({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  borderTop: modalSeparatorBorder,
});

export default function Modal({
  onClose,
  title,
  children,
  footer,
  showCloseButton = false,
  className,
  modalBodyClassName,
}: Props): JSX.Element {
  return (
    <Overlay backgroundStyle={backgroundStyle} clickOutside={onClose}>
      <div className={cx(modalStyle, className || '')}>
        <div className={modalHeader}>
          <Flex grow={1} align={'center'} className={titleStyle}>
            {title}
          </Flex>
          {showCloseButton ? (
            <IconButton
              className={cx(closeIconStyle, lightIconButtonStyle)}
              iconSize="lg"
              title="Close"
              icon={faTimes}
              onClick={onClose}
            />
          ) : null}
        </div>
        <Flex grow={1} direction="column" overflow="auto" className={cx(modalBody, modalBodyClassName)}>
          {children(onClose)}
        </Flex>
        {footer && <div className={modalFooter}>{footer(onClose)}</div>}
      </div>
    </Overlay>
  );
}
