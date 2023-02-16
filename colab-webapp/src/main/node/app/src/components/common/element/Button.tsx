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
  invertedButtonStyle,
  space_sm,
} from '../../styling/style';
import Clickable, { ClickableProps } from '../layout/Clickable';
import Flex from '../layout/Flex';
import Icon, { IconSize } from '../layout/Icon';


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

export interface ButtonProps extends ClickableProps {
  icon?: string;
  iconColor?: string;
  iconSize?: keyof typeof IconSize;
  reverseOrder?: boolean;
  invertedButton?: boolean;
  isLoading?: boolean;
}

export default function Button({
  title,
  icon,
  iconColor,
  iconSize,
  reverseOrder,
  onClick,
  children,
  invertedButton,
  className,
  isLoading = false,
}: ButtonProps): JSX.Element {
  return (
    <Clickable
      title={title}
      onClick={onClick}
      className={cx(invertedButton ? invertedButtonStyle : buttonStyle, relative, className)}
    >
      <Flex align="center" className={cx({ [css({ opacity: 0 })]: isLoading })}>
      {reverseOrder && children}
      {icon && (
         <Icon
          icon={icon}
          color={iconColor}
          opsz={iconSize}
          className={reverseOrder ? css({ marginLeft: space_sm }) : css({ marginRight: space_sm })}
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
};

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

  return <Button {...restProps} onClick={onClickCb} isLoading={loading} />;
}