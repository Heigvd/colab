/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { IconProp, Transform } from '@fortawesome/fontawesome-svg-core';
import * as React from 'react';
import { iconButton, linkStyle } from '../../styling/style';
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
  clickable?: boolean;
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
      className={className}
      clickableClassName={cx(linkStyle, iconButton, className)}
      clickable
      stopPropagation={stopPropagation}
    >
      <Icon icon={icon} className={iconClassName} opsz={iconSize} color={iconColor}/>
      {/* {layer ? (
        <span className="fa-layers fa-fw">
           <Icon
            icon={layer.layerIcon}
            color={iconColor}
            size={iconSize}
            transform={layer.transform}
          />
           <Icon
            icon={icon}
            color={iconColor}
            size={iconSize}
            transform={transform}
            mask={mask}
          />
        </span>
      ) : (
         <Icon
          icon={icon}
          color={iconColor}
          size={iconSize}
          mask={mask}
          className={IconClassName}
        />
      )} */}
    </Clickable>
  );
}
