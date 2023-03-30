/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import React from 'react';
import { MaterialIconsType } from '../../styling/IconType';
import {
  br_md,
  ellipsisStyle,
  p_xs,
  text_lg,
  text_md,
  text_sm,
  text_xs,
} from '../../styling/style';
import { ThemeType } from '../../styling/theme';
import Flex from '../layout/Flex';
import Icon from '../layout/Icon';

type BadgeVariantType = 'solid' | 'outline' | 'ghost';
export type BadgeSizeType = 'sm' | 'md' | 'lg';

function SolidBadgeStyle(theme: ThemeType) {
  return css({
    backgroundColor: `var(--${theme}-main)`,
    border: '1px solid transparent',
    color: `var(--${theme}-contrast)`,
  });
}

function OutlineBadgeStyle(theme: ThemeType) {
  return css({
    backgroundColor: `transparent`,
    border: `1px solid var(--${theme}-main)`,
    color: `var(--${theme}-main)`,
  });
}

const ghostBadgeStyle = css({
  backgroundColor: `var(--gray-100)`,
  border: '1px solid transparent',
  color: `var(--text-primary)`,
});

function BadgeSize(size: BadgeSizeType): string {
  switch (size) {
    case 'sm':
      return text_sm;
    case 'md':
      return text_md;
    case 'lg':
      return text_lg;
    default:
      return cx(text_md);
  }
}

function BadgeStyle(variant: BadgeVariantType, size: BadgeSizeType, theme: ThemeType): string {
  switch (variant) {
    case 'solid':
      return cx(BadgeSize(size), SolidBadgeStyle(theme));
    case 'outline':
      return cx(BadgeSize(size), OutlineBadgeStyle(theme));
    case 'ghost':
      return cx(BadgeSize(size), ghostBadgeStyle);
    default:
      return cx(BadgeSize(size), SolidBadgeStyle(theme));
  }
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  size?: BadgeSizeType;
  icon?: MaterialIconsType;
  variant?: BadgeVariantType;
  theme?: ThemeType;
  className?: string;
}

export default function Badge({
  children,
  size = 'sm',
  icon,
  variant = 'solid',
  theme = 'primary',
  className,
}: BadgeProps): JSX.Element {
  return (
    <Flex
      align="center"
      className={cx(
        br_md,
        p_xs,
        text_xs,
        ellipsisStyle,
        BadgeStyle(variant, size, theme),
        className,
      )}
    >
      {icon && <Icon icon={icon} opsz="xs" />}
      <div className={ellipsisStyle}>{children}</div>
    </Flex>
  );
}
