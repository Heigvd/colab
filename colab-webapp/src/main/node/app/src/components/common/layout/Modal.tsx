/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { cardStyle, space_3xl, space_xs, p_lg } from '../../styling/style';
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
  size?: 'full' | 'sm' | 'md' | 'lg';
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
/*     maxWidth: '800px',
    maxHeight: '580px',
    minWidth: '400px',
    minHeight: '200px', */
    boxShadow: '0 3px 6px rgba(0,0,0,.16)',
    borderRadius: '8px',
  }),
);

const fullScreenStyle = cx(
  css({
    height: `calc(100vh - ${space_3xl})`,
    width: `calc(100vw - ${space_3xl})`,
  }),
);

export const modalSeparatorBorder = 'solid 1px var(--divider-main)';

const modalHeader = css({
  display: 'flex',
  alignItems: 'center',
  borderBottom: modalSeparatorBorder,
  padding: space_xs,
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
  size
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
      <div className={cx(modalStyle, {[fullScreenStyle]: size === 'full'}, className || '')}>
        {(title || showCloseButton) && (
          <>
            <div className={modalHeader}>
              <Flex grow={1} align={'center'}>
                {title}
              </Flex>
              {showCloseButton && (
                <IconButton
                  icon={'close'}
                  title={i18n.common.close}
                  onClick={onClose}
                />
              )}
            </div>
          </>
        )}
        <Flex
          grow={1}
          direction="column"
          overflow="auto"
          className={cx({[p_lg]: size != 'full'}, modalBodyClassName)}
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
