/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { cardStyle, lightIconButtonStyle, space_L, space_M, space_S } from '../../styling/style';
import IconButton from '../element/IconButton';
import Flex from './Flex';
import Overlay from './Overlay';

interface ModalProps {
  title: React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
  footer?: (collapse: () => void) => React.ReactNode;
  showCloseButton?: boolean;
  onClose: () => void;
  className?: string;
  modalBodyClassName?: string;
  onEnter?: (collapse: () => void) => void;
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

export const modalBody = css({
  padding: space_L,
});
export const modalFooter = css({
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
  onEnter,
}: ModalProps): JSX.Element {
  const i18n = useTranslations();

  const handleEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (onEnter) {
        onEnter(onClose);
      }
    } else if (event.key === 'Escape') {
      if (showCloseButton) {
        onClose();
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleEnter, true);
    return () => {
      document.removeEventListener('keydown', handleEnter, true);
    };
  });
  return (
    <Overlay backgroundStyle={backgroundStyle} onClickOutside={onClose}>
      <div className={cx(modalStyle, className || '')}>
        {(title || showCloseButton) && (
          <>
            <div className={modalHeader}>
              <Flex grow={1} align={'center'} className={titleStyle}>
                {title}
              </Flex>
              {showCloseButton && (
                <IconButton
                  icon={'close'}
                  title={i18n.common.close}
                  iconSize="lg"
                  onClick={onClose}
                  className={cx(closeIconStyle, lightIconButtonStyle)}
                />
              )}
            </div>
          </>
        )}
        <Flex
          grow={1}
          direction="column"
          overflow="auto"
          className={cx(modalBody, modalBodyClassName)}
        >
          {children(onClose)}
        </Flex>
        {footer && (
          <Flex align="stretch" className={modalFooter}>
            {footer(onClose)}
          </Flex>
        )}
      </div>
    </Overlay>
  );
}
