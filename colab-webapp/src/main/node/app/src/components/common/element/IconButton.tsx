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
import { iconButton, linkStyle } from '../../styling/style';
import Clickable from '../layout/Clickable';

export interface IconButtonProps {
  title: string;
  icon: IconProp;
  iconColor?: string;
  iconSize?: SizeProp;
  mask?: IconProp;
  transform?: string | Transform;
  layer?: { layerIcon: IconProp; transform: string | Transform };
  clickable?: boolean;
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  className?: string;
  IconClassName?: string;
}

export default function IconButton({
  title,
  icon,
  iconColor,
  iconSize,
  mask,
  transform,
  layer,
  onClick,
  className,
  IconClassName,
}: IconButtonProps): JSX.Element {
  return (
    <Clickable
      title={title}
      onClick={onClick}
      className={className}
      clickableClassName={cx(linkStyle, iconButton, className)}
    >
      {layer ? (
        <span className="fa-layers fa-fw">
          <FontAwesomeIcon
            icon={layer.layerIcon}
            color={iconColor}
            size={iconSize}
            transform={layer.transform}
          />
          <FontAwesomeIcon
            icon={icon}
            color={iconColor}
            size={iconSize}
            transform={transform}
            mask={mask}
          />
        </span>
      ) : (
        <FontAwesomeIcon
          icon={icon}
          color={iconColor}
          size={iconSize}
          mask={mask}
          className={IconClassName}
        />
      )}
    </Clickable>
  );
}
