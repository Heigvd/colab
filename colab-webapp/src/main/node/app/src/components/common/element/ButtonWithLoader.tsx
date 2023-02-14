/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import {
  buttonStyle,
  inactiveButtonStyle,
  inactiveInvertedButtonStyle,
  invertedButtonStyle,
  space_S,
} from '../../styling/style';
import Clickable from '../layout/Clickable';
import Flex from '../layout/Flex';
import Icon from '../layout/Icon';
import { ButtonProps } from './Button';

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

export interface ButtonWithLoaderProps extends ButtonProps {
  isLoading?: boolean;
}

export default function ButtonWithLoader({
  title,
  icon,
  iconColor,
  iconSize,
  reverseOrder,
  clickable,
  isLoading = false,
  onClick,
  children,
  invertedButton,
  className,
}: ButtonWithLoaderProps): JSX.Element {
  return (
    <Clickable
      title={title}
      clickable={clickable}
      onClick={onClick}
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
      <Flex align="center" className={cx({ [css({ opacity: 0 })]: isLoading })}>
        {reverseOrder && children}
        {icon && (
           <Icon
            icon={icon}
            color={iconColor}
            opsz={iconSize}
            className={reverseOrder ? css({ marginLeft: space_S }) : css({ marginRight: space_S })}
          />
        )}
        {!reverseOrder && children}
      </Flex>
      {isLoading && (
        <div className={cx({ [overlayIconStyle]: isLoading })}>
           <Icon icon={'sync'} color={iconColor} opsz={iconSize} />
        </div>
      )}
    </Clickable>
  );
}

interface AsyncButtonWithLoaderProps extends ButtonProps {
  onClick?: (
    e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>,
  ) => Promise<unknown>;
}

export function AsyncButtonWithLoader(props: AsyncButtonWithLoaderProps) {
  const { onClick, ...restProps } = props;
  const [loading, setLoading] = React.useState(false);

  const onClickCb = React.useMemo(() => {
    if (onClick) {
      return (e: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent<HTMLSpanElement>) => {
        setLoading(true);
        onClick(e).then(() => {
          setLoading(false);
        });
      };
    }
  }, [onClick]);

  return <ButtonWithLoader {...restProps} onClick={onClickCb} isLoading={loading} />;
}
