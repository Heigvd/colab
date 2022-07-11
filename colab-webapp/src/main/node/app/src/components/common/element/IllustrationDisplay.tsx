/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { IconName, library, SizeProp } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Illustration } from 'colab-rest-client';
import React from 'react';
import { space_S } from '../../styling/style';
import Flex, { FlexProps } from '../layout/Flex';

interface IllustrationDisplayProps {
  illustration: Illustration;
  iconSize?: string;
  align?: FlexProps['align'];
  justify?: FlexProps['justify'];
}

export default function IllustrationDisplay({
  illustration,
  iconSize,
  align,
  justify,
}: IllustrationDisplayProps): JSX.Element {
  library.add(fas, far); // TODO sandra work in progress // or just the icon we need

  return (
    <Flex
      align={align != null ? align : 'center'}
      justify={justify != null ? justify : 'center'}
      className={css({
        backgroundColor: `${
          illustration.iconBkgdColor ? illustration.iconBkgdColor : 'var(--secondaryColor)'
        }`,
        height: `calc(100% - 2*${space_S})`,
        width: `calc(100% - 2*${space_S})`,
        padding: space_S,
      })}
    >
      {illustration.iconLibrary === 'FONT_AWESOME_SOLID' ||
      illustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? (
        <FontAwesomeIcon
          icon={{
            prefix: illustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? 'far' : 'fas',
            iconName: illustration.iconKey as IconName,
          }}
          color={'#fff'}
          size={iconSize ? (iconSize as SizeProp) : '3x'}
        />
      ) : (
        <p>
          Oh a new icon library, dear developer please make what is needed to display the icon{' '}
          {illustration.iconKey} of library {illustration.iconLibrary}
        </p>
      )}
    </Flex>
  );
}

{
  /* TODO sandra work in progress : remove tries */
}
{
  /* A<FontAwesomeIcon icon={illustration.iconKey as IconName} />
      B<FontAwesomeIcon icon={illustration.iconKey as IconProp} />
      1 <FontAwesomeIcon icon={faTractor} />
      2 <FontAwesomeIcon icon={'tractor' as IconName} />
      3 <FontAwesomeIcon icon={'fa-tractor' as IconName} />
      4 <FontAwesomeIcon icon={'tractor' as IconProp} />
      5 <FontAwesomeIcon icon={'fa-tractor' as IconProp} />
      6 <FontAwesomeIcon icon={{ prefix: 'fas', iconName: 'tractor' }} /> */
}
