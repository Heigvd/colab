/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx, keyframes } from '@emotion/css';
import * as React from 'react';
import {
  buttonStyle,
  OutlineButtonStyle,
  SolidButtonStyle,
  space_2xs,
  space_lg,
  space_md,
  space_sm,
  space_xl,
  space_xs,
  text_lg,
  text_md,
  text_sm,
  text_xs,
} from '../../styling/style';
import { GeneralSizeType, ThemeType } from '../../styling/theme';
import Clickable, { ClickableProps } from '../layout/Clickable';
import Flex from '../layout/Flex';
import Icon, { IconSize } from '../layout/Icon';

type ButtonVariantType = 'solid' | 'outline' | 'unstyled';
const spinning = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});
const loadingAnim = css({ animation: `linear ${spinning} 1s infinite` });
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

const xsStyle = cx(
  text_xs,
  css({
    padding: '0 ' + space_sm,
  }),
);

const smStyle = cx(
  text_sm,
  css({
    padding: space_2xs + ' ' + space_md,
  }),
);

const mdStyle = cx(
  text_md,
  css({
    padding: space_xs + ' ' + space_lg,
  }),
);

const lgStyle = cx(
  text_lg,
  css({
    padding: space_sm + ' ' + space_xl,
  }),
);

function ButtonSize(size: GeneralSizeType): string {
  switch (size) {
    case 'xs':
      return cx(xsStyle);
    case 'sm':
      return cx(smStyle);
    case 'md':
      return cx(mdStyle);
    case 'lg':
      return cx(lgStyle);
    default:
      return cx(mdStyle);
  }
}

function ButtonStyle(variant: ButtonVariantType, size: GeneralSizeType, theme: ThemeType): string {
  switch (variant) {
    case 'solid':
      return cx(ButtonSize(size), SolidButtonStyle(theme));
    case 'outline':
      return cx(ButtonSize(size), OutlineButtonStyle(theme));
    case 'unstyled':
      return cx(ButtonSize(size));
    default:
      return cx(ButtonSize(size), SolidButtonStyle(theme));
  }
}

export interface ButtonProps extends ClickableProps {
  icon?: string;
  iconColor?: string;
  iconSize?: keyof typeof IconSize;
  reverseOrder?: boolean;
  isLoading?: boolean;
  variant?: ButtonVariantType;
  size?: GeneralSizeType;
  theme?: ThemeType;
}

export default function Button({
  title,
  icon,
  iconColor,
  iconSize,
  reverseOrder,
  onClick,
  children,
  disabled,
  className,
  isLoading = false,
  variant = 'solid',
  size = 'md',
  theme = 'primary',
}: ButtonProps): JSX.Element {
  return (
    <Clickable
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(buttonStyle, ButtonStyle(variant, size, theme), className)}
    >
      <Flex align="center" className={cx({ [css({ opacity: 0 })]: isLoading })}>
        {reverseOrder && children}
        {icon && (
          <Icon
            icon={icon}
            color={iconColor}
            opsz={iconSize}
            className={
              reverseOrder ? css({ marginLeft: space_sm }) : css({ marginRight: space_sm })
            }
          />
        )}
        {!reverseOrder && children}
      </Flex>
      {isLoading && (
        <div className={overlayIconStyle}>
          <Icon icon={'refresh'} color={'white'} opsz={iconSize} className={cx({ [loadingAnim]: isLoading })}/>
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

  return <Button {...restProps} onClick={onClickCb} isLoading={loading} />;
}
