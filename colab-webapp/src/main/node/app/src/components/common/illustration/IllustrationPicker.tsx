/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Illustration } from 'colab-rest-client';
import * as React from 'react';
import { CirclePicker } from 'react-color';
import useTranslations from '../../../i18n/I18nContext';
import { MaterialIconsType } from '../../../styling/IconType';
import { labelStyle, space_lg, space_sm } from '../../../styling/style';
import { projectColors } from '../../../styling/theme';
import { defaultProjectIllustration } from '../../projects/ProjectCommon';
import IconButton from '../element/IconButton';
import Flex from '../layout/Flex';

interface IllustrationPickerProps {
  illustration: Illustration | undefined | null;
  setIllustration: (i: Illustration) => void;
  iconList: MaterialIconsType[];
  iconContainerClassName?: string;
  colorContainerClassName?: string;
  className?: string;
}

export default function ProjectIllustrationPicker({
  illustration,
  setIllustration,
  iconList,
  iconContainerClassName,
  colorContainerClassName,
  className,
}: IllustrationPickerProps): JSX.Element {
  const i18n = useTranslations();
  const illustrationCurrent = illustration ? illustration : defaultProjectIllustration;
  return (
    <Flex direction="column" align="stretch" className={className}>
      <div className={cx(css({ marginTop: space_sm }), colorContainerClassName)}>
        <label className={labelStyle}>{i18n.modules.card.settings.color}</label>
        <CirclePicker
          colors={Object.values(projectColors)}
          onChangeComplete={c => setIllustration({ ...illustrationCurrent, iconBkgdColor: c.hex })}
          color={illustrationCurrent.iconBkgdColor}
          width={'auto'}
          className={css({ marginTop: space_sm, padding: space_sm })}
        />
      </div>
      <div className={cx(css({ marginTop: space_sm }))}>
        <label className={labelStyle}>{i18n.common.icon}</label>
        <IconPicker
          bgColor={illustrationCurrent.iconBkgdColor}
          iconList={iconList}
          choosenIcon={illustrationCurrent.iconKey}
          onChange={i => setIllustration({ ...illustrationCurrent, iconKey: i })}
          className={iconContainerClassName}
        />
      </div>
    </Flex>
  );
}

interface IconPickerProps {
  bgColor: string;
  iconList: MaterialIconsType[];
  choosenIcon: string;
  onChange: (icon: MaterialIconsType) => void;
  className?: string;
}
function IconPicker({
  bgColor,
  iconList,
  choosenIcon,
  onChange,
  className,
}: IconPickerProps): JSX.Element {
  return (
    <>
      <div
        className={cx(
          css({
            display: 'flex',
            flexWrap: 'wrap',
            backgroundColor: bgColor,
            padding: space_lg,
            maxHeight: '140px',
            overflow: 'auto',
            cursor: 'default',
            minWidth: '200px',
          }),
          className,
        )}
      >
        {iconList.map(i => (
          <IconButton
            key={i}
            title={i}
            icon={i}
            iconSize={'md'}
            onClick={() => onChange(i)}
            className={css({
              color: 'var(--bg-primary)',
              opacity: choosenIcon === i ? 1 : 0.6,
              '&:not(:disabled):hover': {
                color: 'var(--bg-primary)',
                opacity: 1,
              },
            })}
          />
        ))}
      </div>
    </>
  );
}
