/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import React from 'react';
import { br_full, space_xs } from '../../styling/style';
import Flex from '../layout/Flex';

const badgeStyle = cx(
  br_full,
  css({
    background: 'var(--transparent)',
    padding: space_xs,
    border: '1px solid var(--text-secondary)',
    color: 'var(--text-secondary)',
    '&:hover': {
        border: '1px solid var(--text-primary)',
    color: 'var(--text-primary)',
    }
  }),
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  color: string;
  size: string;
  icon?: string;
}

export default function Avatar({ children }: BadgeProps): JSX.Element {
  return (
    <Flex className={badgeStyle}>
         {children}
    </Flex>
  );
}
