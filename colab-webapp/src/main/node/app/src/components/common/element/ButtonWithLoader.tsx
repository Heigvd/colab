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
} from '../../styling/style';
import Clickable, { ClickableProps } from '../layout/Clickable';
import Flex from '../layout/Flex';

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
  icon?: IconProp;
  iconColor?: string;
  iconSize?: SizeProp;
  reverseOrder?: boolean;
  isLoading?: boolean;
  invertedButton?: boolean;
}

export default function ButtonWithLoader({
  title,
  icon,
  iconColor,
  iconSize,
  reverseOrder,
  clickable,
  isLoading = true,
  onClick,
  children,
  invertedButton,
  className,
}: ButtonWithLoaderProps): JSX.Element {
  const [processing, setProcessing] = React.useState<boolean>(false);

  return (
    <Clickable
      title={title}
      clickable={clickable}
      onClick={e => {
        if (onClick) {
          setProcessing(isLoading);
          onClick(e);
        }
      }}
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
    >
      <Flex align="center" className={cx({ [css({ opacity: 0 })]: processing })}>
        {reverseOrder && children}
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            color={iconColor}
            size={iconSize}
            className={reverseOrder ? css({ marginLeft: space_S }) : css({ marginRight: space_S })}
          />
        )}
        {!reverseOrder && children}
      </Flex>
      {processing && (
        <div className={cx({ [overlayIconStyle]: processing })}>
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
