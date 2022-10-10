/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { IconProp, SizeProp, Transform } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { iconButton, linkStyle } from '../../styling/style';
import Clickable from '../layout/Clickable';

export interface IconButtonWithLoaderProps {
  title: string;
  icon: IconProp;
  iconColor?: string;
  iconSize?: SizeProp;
  mask?: IconProp;
  transform?: string | Transform;
  layer?: { layerIcon: IconProp; transform: string | Transform };
  //clickable?: boolean;
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
  mask,
  transform,
  layer,
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
      {layer ? (
        <>
          {loading ? (
            <>
              <FontAwesomeIcon
                icon={faSpinner}
                color={iconColor}
                size={iconSize}
                mask={mask}
                pulse
                className={IconClassName}
              />
            </>
          ) : (
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
          )}
        </>
      ) : (
        <FontAwesomeIcon
          icon={loading ? faSpinner : icon}
          color={iconColor}
          size={iconSize}
          mask={mask}
          pulse={loading}
          className={IconClassName}
        />
      )}
    </Clickable>
  );
}
