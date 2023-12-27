/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Illustration } from 'colab-rest-client';
import * as React from 'react';
import { MaterialIconsType } from '../../../../styling/IconType';
import { space_sm } from '../../../../styling/style';
import { defaultProjectIllustration } from '../../../projects/ProjectCommon';
import Flex, { FlexProps } from '../../layout/Flex';
import Icon, { IconSize } from '../../layout/Icon';

interface IllustrationDisplayProps {
  illustration: Illustration | undefined | null;
  iconColor?: string;
  iconSize?: keyof typeof IconSize;
  align?: FlexProps['align'];
  justify?: FlexProps['justify'];
  className?: string;
}

export default function IllustrationDisplay({
  illustration,
  iconColor,
  align,
  justify,
  className,
}: IllustrationDisplayProps): JSX.Element {
  const currentIllustration = illustration || defaultProjectIllustration;
  return (
    <Flex
      align={align != null ? align : 'center'}
      justify={justify != null ? justify : 'center'}
      className={cx(
        css({
          backgroundColor: `${
            currentIllustration.iconBkgdColor
              ? currentIllustration.iconBkgdColor
              : defaultProjectIllustration.iconBkgdColor
          }`,
          height: `calc(100% - 2*${space_sm})`,
          width: `calc(100% - 2*${space_sm})`,
          padding: space_sm,
        }),
        className,
      )}
    >
      <Icon
        icon={currentIllustration.iconKey as MaterialIconsType}
        color={iconColor || 'var(--white)'}
        opsz={'md'}
      />
    </Flex>
  );
}

export function IllustrationIconDisplay({
  illustration,
  iconColor,
  className,
  iconSize,
}: IllustrationDisplayProps): JSX.Element {
  const currentIllustration = illustration || defaultProjectIllustration;
  return (
    <Icon
      icon={currentIllustration.iconKey as MaterialIconsType}
      color={iconColor || currentIllustration.iconBkgdColor}
      className={className}
      opsz={iconSize}
    />
  );
}
