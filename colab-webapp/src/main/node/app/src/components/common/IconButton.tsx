/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { IconProp, SizeProp, Transform } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { iconButton, linkStyle } from '../styling/style';
import Clickable from './Clickable';

export interface IconButtonProps {
  icon: IconProp;
  mask?: IconProp;
  layer?: { layerIcon: IconProp; transform: string | Transform };
  iconSize?: SizeProp;
  iconColor?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  clickable?: boolean;
  title: string;
  className?: string;
}

export default function IconButton({
  onClick,
  icon,
  mask,
  layer,
  title,
  className,
  iconColor,
  iconSize,
}: IconButtonProps): JSX.Element {
  return (
    <Clickable
      onClick={onClick}
      title={title}
      className={className}
      clickableClassName={cx(linkStyle, iconButton, className)}
    >
      {layer ? (
        <span className="fa-layers fa-fw">
          <FontAwesomeIcon icon={layer.layerIcon} color={iconColor} size={iconSize} transform={layer.transform} />
          <FontAwesomeIcon icon={icon} color={iconColor} size={iconSize} mask={mask} />
        </span>
      ) : (
        <FontAwesomeIcon icon={icon} color={iconColor} size={iconSize} mask={mask} />
      )}
    </Clickable>
  );
}
