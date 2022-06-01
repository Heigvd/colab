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
import { iconButton, linkStyle, spinningStyle } from '../styling/style';
import Clickable from './Clickable';

export interface IconButtonWithLoaderProps {
  icon: IconProp;
  mask?: IconProp;
  transform?: string | Transform;
  layer?: { layerIcon: IconProp; transform: string | Transform };
  iconSize?: SizeProp;
  iconColor?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => void;
  clickable?: boolean;
  title: string;
  className?: string;
  IconClassName?: string;
  isLoading?: boolean;
}

export default function IconButtonWithLoader({
  onClick,
  icon,
  mask,
  transform,
  layer,
  title,
  className,
  IconClassName,
  iconColor,
  iconSize,
  isLoading = true,
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
                className={cx(spinningStyle, IconClassName)}
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
          className={cx({ [spinningStyle]: loading }, IconClassName)}
        />
      )}
    </Clickable>
  );
}
