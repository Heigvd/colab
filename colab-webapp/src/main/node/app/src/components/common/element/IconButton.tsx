/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { iconButtonStyle, text_lg, text_md, text_sm, text_xs } from '../../styling/style';
import { GeneralSizeType } from '../../styling/theme';
import Clickable, { ClickableProps } from '../layout/Clickable';
import Icon, { IconSize } from '../layout/Icon';

type IconButtonVariantType = 'ghost' | 'initial';

const ghostIconButtonStyle = css({
  backgroundColor: `var(--bg-primary)`,
  color: 'var(--text-secondary)',
  ':hover': {
    backgroundColor: `var(--gray-100)`,
  },
  ':active': {
    backgroundColor: `var(--gray-200)`,
  },
});

function IconButtonSize(size: GeneralSizeType): string {
  switch (size) {
    case 'xs':
      return text_xs;
    case 'sm':
      return text_sm;
    case 'md':
      return text_md;
    case 'lg':
      return text_lg;
    default:
      return text_md;
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
  size?: GeneralSizeType;
}

export default function IconButton({
  title,
  icon,
  iconColor,
  iconSize,
  withLoader,
  isLoading = true,
  onClick,
  className,
  iconClassName,
  stopPropagation,
  variant = 'initial',
  size = 'md',
  disabled,
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
        IconButtonSize(size),
        { [ghostIconButtonStyle]: variant === 'ghost' },
        className,
      )}
      stopPropagation={stopPropagation}
      disabled={disabled}
    >
      <Icon
        icon={loading ? 'sync' : icon}
        className={iconClassName}
        opsz={iconSize}
        color={iconColor}
      />
    </Clickable>
  );
}
