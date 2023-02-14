/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconName, library, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Illustration } from 'colab-rest-client';
import React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { defaultProjectIllustration } from '../../projects/ProjectCommon';
import { space_sm } from '../../styling/style';
import Flex, { FlexProps } from '../layout/Flex';

interface IllustrationDisplayProps {
  illustration: Illustration | undefined | null;
  iconSize?: string;
  iconColor?: string;
  align?: FlexProps['align'];
  justify?: FlexProps['justify'];
  className?: string;
}

export default function IllustrationDisplay({
  illustration,
  iconSize,
  iconColor,
  align,
  justify,
  className,
}: IllustrationDisplayProps): JSX.Element {
  library.add(fas, far);
  const currentIllustration = illustration || defaultProjectIllustration;
  const i18n = useTranslations();
  return (
    <Flex
      align={align != null ? align : 'center'}
      justify={justify != null ? justify : 'center'}
      className={cx(
        css({
          backgroundColor: `${
            currentIllustration.iconBkgdColor ? currentIllustration.iconBkgdColor : '#50BFD5'
          }`,
          height: `calc(100% - 2*${space_sm})`,
          width: `calc(100% - 2*${space_sm})`,
          padding: space_sm,
        }),
        className,
      )}
    >
      {currentIllustration.iconLibrary === 'FONT_AWESOME_SOLID' ||
      currentIllustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? (
         <FontAwesomeIcon
          icon={{
            prefix: currentIllustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? 'far' : 'fas',
            iconName: currentIllustration.iconKey as IconName,
          }}
          color={iconColor || '#fff'}
          size={iconSize ? (iconSize as SizeProp) : '3x'}
        />
      ) : (
        <p>
          {i18n.modules.project.settings.missingIcon}({currentIllustration.iconKey} of lib{' '}
          {currentIllustration.iconLibrary})
        </p>
      )}
    </Flex>
  );
}

export function IllustrationIconDisplay({
  illustration,
  iconSize,
  iconColor,
  className,
}: IllustrationDisplayProps): JSX.Element {
  library.add(fas, far);
  const currentIllustration = illustration || defaultProjectIllustration;
  const i18n = useTranslations();
  return (
    <>
      {currentIllustration.iconLibrary === 'FONT_AWESOME_SOLID' ||
      currentIllustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? (
         <FontAwesomeIcon
          icon={{
            prefix: currentIllustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? 'far' : 'fas',
            iconName: currentIllustration.iconKey as IconName,
          }}
          color={iconColor || currentIllustration.iconBkgdColor}
          size={iconSize ? (iconSize as SizeProp) : '1x'}
          className={className}
        />
      ) : (
        <p>
          {i18n.modules.project.settings.missingIcon}({currentIllustration.iconKey} of lib{' '}
          {currentIllustration.iconLibrary})
        </p>
      )}
    </>
  );
}
