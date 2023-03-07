/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx, keyframes } from '@emotion/css';
import * as React from 'react';
import {
  GhostIconButtonStyle,
  iconButtonStyle,
  LightIconButtonStyle,
} from '../../styling/style';
import { ThemeType } from '../../styling/theme';
import Clickable, { ClickableProps } from '../layout/Clickable';
import Icon, { IconSize } from '../layout/Icon';
const spinning = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});
const loadingAnim = css({animation: `ease-in-out ${spinning} 2.5s infinite`,});

type IconButtonVariantType = 'ghost' | 'initial' | 'unstyled';


function IconButtonStyle(variant: IconButtonVariantType, theme?: ThemeType): string {
  switch (variant) {
    case 'ghost':
      return GhostIconButtonStyle(theme);
    case 'initial':
      return LightIconButtonStyle(theme);
    default:
      return GhostIconButtonStyle(theme);
  }
}

export interface IconButtonProps extends ClickableProps {
  title: string;
  icon: string;
  iconColor?: string;
  iconSize?: keyof typeof IconSize;
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  className?: string;
  iconClassName?: string;
  stopPropagation?: boolean;
  withLoader?: boolean;
  isLoading?: boolean;
  variant?: IconButtonVariantType;
  theme?: ThemeType;
}

export default function IconButton({
  title,
  icon,
  iconColor,
  iconSize = 'sm',
  withLoader,
  isLoading = true,
  onClick,
  className,
  iconClassName,
  stopPropagation,
  variant = 'initial',
  disabled,
  theme,
}: IconButtonProps): JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);
  return (
    <Clickable
      title={title}
      onClick={e => {
        if (withLoader && onClick) {
          setLoading(isLoading);
          onClick(e);
        } else if (onClick) {
          onClick(e);
        }
      }}
      className={cx(
        iconButtonStyle,
        IconButtonStyle(variant, theme),
        className,
      )}
      stopPropagation={stopPropagation}
      disabled={disabled}
    >
      <Icon
        icon={loading ? 'sync' : icon}
        className={cx({[loadingAnim]: loading}, iconClassName)}
        opsz={iconSize}
        color={iconColor}
      />
    </Clickable>
  );
}
