/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { IconProp, Transform } from '@fortawesome/fontawesome-svg-core';
import * as React from 'react';
import { iconButtonStyle, linkStyle } from '../../styling/style';
import Clickable from '../layout/Clickable';
import Icon, { IconSize } from '../layout/Icon';

export interface IconButtonProps {
  title: string;
  icon: string;
  iconColor?: string;
  iconSize?: keyof typeof IconSize;
  mask?: IconProp;
  transform?: string | Transform;
  layer?: { layerIcon: IconProp; transform: string | Transform };
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  className?: string;
  iconClassName?: string;
  stopPropagation?: boolean;
}

export default function IconButton({
  title,
  icon,
  iconColor,
  iconSize,
  onClick,
  className,
  iconClassName,
  stopPropagation,
}: IconButtonProps): JSX.Element {
  return (
    <Clickable
      title={title}
      onClick={onClick}
      className={cx(linkStyle, iconButtonStyle, className)}
      stopPropagation={stopPropagation}
    >
      <Icon icon={icon} className={iconClassName} opsz={iconSize} color={iconColor}/>
    </Clickable>
  );
}
