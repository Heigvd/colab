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
import {paddingAroundStyle, space_M, space_S } from '../styling/style';

export interface SideCollapsiblePanelProps {
  icon?: IconProp;
  open: boolean;
  toggleOpen: ()=>void;
  children?: React.ReactNode;
  className?: string;
  direction?: "LEFT" | "RIGHT";
}

export default function SideCollapsiblePanel({
  icon,
  open,
  toggleOpen,
  children,
  className,
  direction = "LEFT",
}: SideCollapsiblePanelProps): JSX.Element {
  return (
      <Flex direction="row" className={cx(css({padding: space_M}), className)}>
          <Flex direction='column'>
              <IconButton icon={open ? faChevronLeft : faChevronRight} title={open ? "Close" : "Open"} onClick={toggleOpen} />
              {icon && <FontAwesomeIcon icon={icon} />}
          </Flex>
          {open && children}
      </Flex>
  );
}
