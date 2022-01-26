/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import { paddingAroundStyle, space_M, space_S } from '../styling/style';

export interface SideCollapsiblePanelProps {
  icon?: IconProp;
  open: boolean;
  toggleOpen: () => void;
  children?: React.ReactNode;
  className?: string;
  direction?: 'LEFT' | 'RIGHT';
  title?: string;
}

export default function SideCollapsiblePanel({
  icon,
  open,
  toggleOpen,
  children,
  className,
  direction = 'LEFT',
  title,
}: SideCollapsiblePanelProps): JSX.Element {
  return (
    <Flex
      direction="row"
      align="stretch"
      className={cx(
        direction === 'LEFT'
          ? open && css({ borderRight: '1px solid var(--lightGray)' })
          : open && css({ borderLeft: '1px solid var(--lightGray)' }),
        className,
      )}
    >
      {open && direction === 'RIGHT' && (
        <Flex align="stretch" className={css({ padding: space_M + ' 0 0 0' })}>
          {children}
        </Flex>
      )}
      <Flex
        direction="column"
        justify="flex-start"
        align="center"
        grow={1}
        className={cx(
          direction === 'LEFT'
            ? css({ borderRight: '1px solid var(--lightGray)' })
            : css({ borderLeft: '1px solid var(--lightGray)' }),
          css({ padding: space_M + ' ' + space_S }),
        )}
      >
        <IconButton
          icon={
            open
              ? direction === 'LEFT'
                ? faChevronLeft
                : faChevronRight
              : direction === 'LEFT'
              ? faChevronRight
              : faChevronLeft
          }
          title={title ? (open ? 'Close ' + title : 'Open ' + title) : open ? 'Close' : 'Open'}
          onClick={toggleOpen}
        />
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className={paddingAroundStyle([1, 3], space_S)}
            title={title}
          />
        )}
      </Flex>
      {open && direction === 'LEFT' && (
        <Flex align="stretch" className={css({ padding: space_M + ' 0 0 0' })}>
        {children}
      </Flex>
      )}
    </Flex>
  );
}
