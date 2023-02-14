/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import { iconButton, linkStyle } from '../../styling/style';
import Clickable from '../layout/Clickable';
import Icon, { IconSize } from '../layout/Icon';

export interface IconButtonWithLoaderProps {
  title: string;
  icon: string;
  iconColor?: string;
  iconSize?: keyof typeof IconSize;
  isLoading?: boolean;
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  className?: string;
  IconClassName?: string;
}

export default function IconButtonWithLoader({
  title,
  icon,
  iconColor,
  iconSize,
  isLoading = true,
  onClick,
  className,
  IconClassName,
}: IconButtonWithLoaderProps): JSX.Element {
  const [loading, setLoading] = React.useState<boolean>(false);
  return (
    <Clickable
      onClick={e => {
        if (onClick) {
          setLoading(isLoading);
          onClick(e);
        }
      }}
      title={title}
      className={className}
      clickableClassName={cx(linkStyle, iconButton, className)}
    >
         <Icon
          icon={loading ? 'sync' : icon}
          color={iconColor}
          opsz={iconSize}
          className={IconClassName}
        />
    </Clickable>
  );
}
