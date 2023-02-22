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
import useTranslations from '../../i18n/I18nContext';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import { labelStyle, space_lg, space_sm } from '../styling/style';
import { projectColors } from '../styling/theme';
import { defaultProjectIllustration } from './ProjectCommon';

interface ProjectIllustrationMakerProps {
  illustration: Illustration | undefined | null;
  setIllustration: (i: Illustration) => void;
  iconContainerClassName?: string;
  colorContainerClassName?: string;
  className?: string;
}

const projectIcons: string[] = [
  'gamepad',
  'casino',
  'extension',
  'bug_report',
  'robot',
  'school',
  'music_note',
  'smart_toy',
  'stadia_controller',
  'clear_day',
  'menu_book',
  'water_drop',
  'history_edu',
  'bolt',
  'language',
  'recycling',
  'public',
  'forest',
  'coronavirus',
  'medication',
  'skeleton',
  'nutrition',
  'stethoscope',
  'accessible_forward',
  'palette',
  'landscape',
  'savings',
  'domain',
  'trolley',
  'fire_truck',
];

export function ProjectIllustrationMaker({
  illustration,
  setIllustration,
  iconContainerClassName,
  colorContainerClassName,
  className,
}: ProjectIllustrationMakerProps): JSX.Element {
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
        <label className={labelStyle}>{i18n.modules.project.settings.icon}</label>
        <ProjectIconPicker
          bgColor={illustrationCurrent.iconBkgdColor}
          iconActive={illustrationCurrent.iconKey}
          onChange={i => setIllustration({ ...illustrationCurrent, iconKey: i })}
          className={iconContainerClassName}
        />
      </div>
    </Flex>
  );
}

interface ProjectIconPickerProps {
  bgColor: string;
  iconActive: string;
  onChange: (icon: string) => void;
  className?: string;
}
function ProjectIconPicker({
  bgColor,
  iconActive,
  onChange,
  className,
}: ProjectIconPickerProps): JSX.Element {
  return (
    <>
      <div
        className={cx(
          css({
            display: 'flex',
            /*             gridGap: space_md,
            gridTemplateColumns: 'repeat(auto-fit, 50px)', */
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
        {projectIcons.map(i => (
          <IconButton
            key={i}
            title={i}
            icon={i}
            iconSize={'md'}
            onClick={() => onChange(i)}
            className={css({
              color: 'var(--bg-primary)',
              opacity: iconActive === i ? 1 : 0.6,
              ':hover': {
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
