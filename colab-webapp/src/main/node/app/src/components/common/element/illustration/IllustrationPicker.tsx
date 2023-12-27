/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Illustration } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../../i18n/I18nContext';
import { MaterialIconsType } from '../../../../styling/IconType';
import { labelStyle, space_sm } from '../../../../styling/style';
import { projectColors } from '../../../../styling/theme';
import { defaultProjectIllustration } from '../../../projects/ProjectCommon';
import Flex from '../../layout/Flex';
import IconPicker from '../IconPicker';
import { ColorPicker } from '../color/ColorPicker';

interface IllustrationPickerProps {
  selectedIllustration: Illustration | undefined | null;
  onSelectIllustration: (illu: Illustration) => void;
  iconList: MaterialIconsType[];
  iconContainerClassName?: string;
  className?: string;
}

export default function IllustrationPicker({
  selectedIllustration,
  onSelectIllustration,
  iconList,
  iconContainerClassName,
  className,
}: IllustrationPickerProps): JSX.Element {
  const i18n = useTranslations();
  const illustrationCurrent = selectedIllustration ?? defaultProjectIllustration;
  return (
    <Flex direction="column" align="stretch" className={className}>
      <Flex direction="column" className={cx(css({ marginTop: space_sm }))}>
        <label className={labelStyle}>{i18n.modules.card.settings.color}</label>

        <ColorPicker
          colors={Object.values(projectColors)}
          onChange={newColor =>
            onSelectIllustration({ ...illustrationCurrent, iconBkgdColor: newColor.hex })
          }
          color={illustrationCurrent.iconBkgdColor}
          width="auto"
          className={css({ marginTop: space_sm, padding: space_sm })}
        />
      </Flex>
      <Flex direction="column" className={cx(css({ marginTop: space_sm }))}>
        <label className={labelStyle}>{i18n.common.icon}</label>
        <IconPicker
          selectionColor={illustrationCurrent.iconBkgdColor}
          iconList={iconList}
          selectedIcon={illustrationCurrent.iconKey}
          onSelect={i => onSelectIllustration({ ...illustrationCurrent, iconKey: i })}
          containerClassName={iconContainerClassName}
        />
      </Flex>
    </Flex>
  );
}
