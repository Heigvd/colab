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
import { labelStyle, space_lg, space_md, space_sm, space_xs } from '../../../styling/style';
import { projectColors } from '../../../styling/theme';
import { defaultProjectIllustration } from '../../projects/ProjectCommon';
import IconButton from '../element/IconButton';
import Flex from '../layout/Flex';
import Icon from '../layout/Icon';

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
      <Flex direction="column">
        <label className={labelStyle}>{i18n.modules.project.settings.currentIcon}</label>
        <Icon
          color="var(--white)"
          icon={illustrationCurrent.iconKey as MaterialIconsType}
          opsz={'lg'}
          className={css({
            padding: space_md,
            backgroundColor: illustrationCurrent.iconBkgdColor,
            borderRadius: '5px',
            margin: space_xs,
          })}
        />
      </Flex>

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
            padding: `0 ${space_lg} 0 0`,
            maxHeight: '340px',
            overflow: 'auto',
            cursor: 'default',
            minWidth: '200px',
            marginTop: space_lg,
            marginRight: space_lg,

            /*
            gridGap: space_md,
            gridTemplateColumns: 'repeat(auto-fit, 50px)', 
            backgroundColor: bgColor,
            */
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
            //variant='ghost'
            className={css({
              margin: space_xs,
              color: choosenIcon === i ? bgColor : 'var(--bg-primary)',
              backgroundColor: choosenIcon === i ? 'transparent' : bgColor,
              border: choosenIcon === i ? `3px solid ${bgColor}` : `3px solid transparent`,
              ':not(:disabled):hover': {
                backgroundColor: `${bgColor}`,
                color: 'var(--white)',
                opacity: 0.5,
              },
            })}
          />
        ))}
      </div>
    </>
  );
}
