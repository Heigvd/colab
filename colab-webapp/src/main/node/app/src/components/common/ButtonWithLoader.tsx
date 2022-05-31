/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import {
  buttonStyle,
  inactiveButtonStyle,
  inactiveInvertedButtonStyle,
  invertedButtonStyle,
  space_S,
  spinningStyle,
} from '../styling/style';
import Clickable, { ClickableProps } from './Clickable';
import Flex from './Flex';

const relative = css({
  position: 'relative',
});

const overlayIconStyle = css({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

export interface ButtonWithLoaderProps extends Omit<ClickableProps, 'clickableClassName'> {
  invertedButton?: boolean;
  icon?: IconProp;
  iconSize?: SizeProp;
  reverseOrder?: boolean;
  iconColor?: string;
  isLoading?: boolean;
}

export default function ButtonWithLoader({
  onClick,
  clickable,
  children,
  title,
  className,
  invertedButton,
  icon,
  iconColor,
  iconSize,
  reverseOrder,
  isLoading = true,
}: ButtonWithLoaderProps): JSX.Element {
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
      className={cx(
        invertedButton ? inactiveInvertedButtonStyle : inactiveButtonStyle,
        relative,
        className,
      )}
      clickableClassName={cx(
        invertedButton ? invertedButtonStyle : buttonStyle,
        relative,
        className,
      )}
      clickable={clickable}
    >
      <Flex align="center" className={loading ? css({ opacity: 0 }) : undefined}>
        {reverseOrder ? children : null}
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            color={iconColor}
            size={iconSize}
            className={reverseOrder ? css({ marginLeft: space_S }) : css({ marginRight: space_S })}
          />
        )}
        {!reverseOrder ? children : null}
      </Flex>
      {loading && (
        <div className={cx({ [overlayIconStyle]: loading })}>
          <FontAwesomeIcon
            icon={faSpinner}
            color={iconColor}
            size={iconSize}
            className={cx(spinningStyle)}
          />
        </div>
      )}
    </Clickable>
  );
}
