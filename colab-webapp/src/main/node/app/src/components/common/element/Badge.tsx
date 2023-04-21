/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import React from 'react';
import {
  br_md,
  ellipsisStyle,
  p_xs,
  text_lg,
  text_md,
  text_sm,
  text_xs,
} from '../../../styling/style';
import { ThemeType } from '../../../styling/theme';
import Flex from '../layout/Flex';

// -------------------------------------------------------------------------------------------------
// styles

function solidBadgeStyle(backgroundColor: string, textColor: string) {
  return css({
    backgroundColor: backgroundColor,
    border: '1px solid transparent',
    color: textColor,
  });
}

function outlineBadgeStyle(color: string) {
  return css({
    backgroundColor: 'transparent',
    border: `1px solid ${color}`,
    color: color,
  });
}

const ghostBadgeStyle = css({
  backgroundColor: 'var(--gray-100)',
  border: '1px solid transparent',
  color: 'var(--text-primary)',
});

// -------------------------------------------------------------------------------------------------
// types

export type BadgeKindType = 'solid' | 'outline' | 'subtle';
export type BadgeSizeType = 'sm' | 'md' | 'lg';

// -------------------------------------------------------------------------------------------------
// main component

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  size?: BadgeSizeType;
  kind?: BadgeKindType;
  theme?: ThemeType;
  color?: string;
  className?: string;
}

export default function Badge({
  children,
  size = 'sm',
  kind = 'solid',
  theme = 'primary',
  color,
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
        badgeStyle(kind, size, theme, color),
        className,
      )}
    >
      {children}
    </Flex>
  );
}

// -------------------------------------------------------------------------------------------------
// sub components

function badgeStyle(
  kind: BadgeKindType,
  size: BadgeSizeType,
  theme: ThemeType,
  color?: string,
): string {
  const mainColor = color ? color : `var(--${theme}-main)`;
  const contrastColor = color ? `var(--white)` : `var(--${theme}-contrast)`;

  switch (kind) {
    case 'subtle':
      return cx(badgeSize(size), ghostBadgeStyle);
    case 'outline':
      return cx(badgeSize(size), outlineBadgeStyle(mainColor));
    case 'solid':
    default:
      return cx(badgeSize(size), solidBadgeStyle(mainColor, contrastColor));
  }
}

function badgeSize(size: BadgeSizeType): string {
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
