/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import {
  cardStyle,
  heading_md,
  heading_sm,
  p_lg,
  p_xs,
  space_3xl,
  space_xs,
} from '../../../styling/style';
import IconButton from '../element/IconButton';
import Flex from './Flex';
import Overlay from './Overlay';

export interface ModalProps {
  title: React.ReactNode;
  showCloseButton?: boolean;
  onClose: () => void;
  onPressEnterKey?: (collapse: () => void) => void;
  size?: 'full' | 'sm' | 'md' | 'lg';
  className?: string;
  modalBodyClassName?: string;
  footer?: (collapse: () => void) => React.ReactNode;
  children: (collapse: () => void) => React.ReactNode;
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
    cursor: 'default',
  }),
);

const fullScreenStyle = cx(
  css({
    height: `calc(100vh - ${space_3xl})`,
    width: `calc(100vw - ${space_3xl})`,
  }),
);

// note : the size have been set by a not-UI-expert, feel free to change !
const smallSizeStyle = cx(
  css({
    height: '13em',
    width: '22em',
  }),
);

// note : the size have been set by a not-UI-expert, feel free to change !
const mediumSizeStyle = cx(
  css({
    height: '18em',
    width: '30em',
  }),
);

// note : the size have been set by a not-UI-expert, feel free to change !
const largeSizeStyle = cx(
  css({
    height: '42em',
    width: '58em',
  }),
);

export const modalSeparatorBorder = 'solid 1px var(--divider-main)';

const modalHeader = cx(
  heading_md,
  css({
    display: 'flex',
    alignItems: 'center',
    borderBottom: modalSeparatorBorder,
    padding: space_xs,
  }),
);
export const modalFooter = css({
  borderTop: modalSeparatorBorder,
  fontSize: heading_md,
});

export default function Modal({
  title,
  showCloseButton = false,
  onClose,
  onPressEnterKey,
  size,
  className,
  modalBodyClassName,
  footer,
  children,
}: ModalProps): JSX.Element {
  const i18n = useTranslations();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (onPressEnterKey) {
        onPressEnterKey(onClose);
      }
    } else if (event.key === 'Escape') {
      if (showCloseButton) {
        onClose();
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  });

  return (
    <Overlay backgroundStyle={backgroundStyle} onClickOutside={onClose}>
      <div
        className={cx(
          modalStyle,
          { [fullScreenStyle]: size === 'full' },
          { [smallSizeStyle]: size === 'sm' },
          { [mediumSizeStyle]: size === 'md' },
          { [largeSizeStyle]: size === 'lg' },
          className || '',
        )}
      >
        {(title || showCloseButton) && (
          <>
            <div className={modalHeader}>
              <Flex grow={1} align={'center'} className={heading_sm}>
                {title}
              </Flex>
              {showCloseButton && (
                <IconButton
                  icon={'close'}
                  title={i18n.common.close}
                  onClick={onClose}
                  className={p_xs}
                />
              )}
            </div>
          </>
        )}
        <Flex
          grow={1}
          direction="column"
          overflow="auto"
          //column-gap="100px"

          className={cx({ [p_lg]: size != 'full' }, modalBodyClassName)}
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
