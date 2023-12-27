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
import Flex from '../../layout/Flex';
import Icon, { IconSize } from '../../layout/Icon';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Style

const iconPadding = space_sm;

function containerStyle(backgroundColor: string) {
  return css({
    width: `calc(100% - 2*${iconPadding})`,
    height: `calc(100% - 2*${iconPadding})`,
    padding: iconPadding,
    backgroundColor: backgroundColor,
  });
}

const iconColor = 'var(--white)';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Component

interface IllustrationDisplayProps {
  illustration: Illustration | undefined | null;
  iconSize?: keyof typeof IconSize;
  containerClassName?: string;
}

export default function IllustrationDisplay({
  illustration,
  iconSize = 'md',
  containerClassName,
}: IllustrationDisplayProps): JSX.Element {
  const currentIllustration = illustration || defaultProjectIllustration;

  return (
    <Flex
      justify="center"
      align="center"
      className={cx(
        containerStyle(
          currentIllustration.iconBkgdColor ?? defaultProjectIllustration.iconBkgdColor,
        ),
        containerClassName,
      )}
    >
      <Icon
        icon={currentIllustration.iconKey as MaterialIconsType}
        color={iconColor}
        opsz={iconSize}
      />
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
