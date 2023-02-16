/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import { iconButtonStyle } from '../../styling/style';
import Clickable from '../layout/Clickable';
import Icon, { IconSize } from '../layout/Icon';

export interface IconButtonProps {
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
      className={cx(iconButtonStyle, className)}
      stopPropagation={stopPropagation}
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
