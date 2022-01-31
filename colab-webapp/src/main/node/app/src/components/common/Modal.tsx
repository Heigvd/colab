/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { cardStyle, space_L } from '../styling/style';
import Flex from './Flex';
import IconButton from './IconButton';
import Overlay from './Overlay';

interface Props {
  title: string;
  children: (collapse: () => void) => React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  onClose: () => void;
  className?: string;
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
    minHeight: '250px',
    boxShadow: '0 3px 6px rgba(0,0,0,.16)',
    borderRadius: '8px',
  }),
);

export const modalSeparatorBorder = 'solid 1px #d7d7d7';

const modalHeader = css({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  borderBottom: modalSeparatorBorder,
});

const titleStyle = css({
  fontSize: '24px',
  paddingLeft: '20px',
  fontWeight: 200,
});

const closeIconStyle = css({
  width: '64px',
  textAlign: 'center',
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
}: Props): JSX.Element {
  return (
    <Overlay backgroundStyle={backgroundStyle} clickOutside={onClose}>
      <div className={cx(modalStyle, className || '')}>
        <div className={modalHeader}>
          <Flex grow={1} direction="column" className={titleStyle}>
            {title}
          </Flex>
          {showCloseButton ? (
            <IconButton
              className={closeIconStyle}
              iconSize="2x"
              title="Close"
              icon={faTimes}
              onClick={onClose}
            />
          ) : null}
        </div>
        <Flex grow={1} direction="column" overflow="auto" className={modalBody}>
          {children(onClose)}
        </Flex>
        {footer && <div className={modalFooter}>{footer}</div>}
      </div>
    </Overlay>
  );
}
