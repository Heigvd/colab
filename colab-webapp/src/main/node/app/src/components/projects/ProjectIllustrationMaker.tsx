/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { IconName } from '@fortawesome/free-solid-svg-icons';
import { Illustration } from 'colab-rest-client/dist/ColabClient';
import * as React from 'react';
import { CirclePicker } from 'react-color';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import { borderRadius, labelStyle, space_M, space_S } from '../styling/style';

const defaultProjectIllustration: Illustration = {
  '@class': 'Illustration',
  iconLibrary: 'FONT_AWESOME_SOLID',
  iconKey: 'gamepad' as IconName,
  iconBkgdColor: '#68A8C3',
};

interface ProjectIllustrationMakerProps {
  illustration: Illustration | undefined | null;
  setIllustration: React.Dispatch<React.SetStateAction<Illustration>>;
  iconContainerClassName?: string;
  colorContainerClassName?: string;
  className?: string;
}

const projectIconsSolid: IconName[] = [
  'gamepad',
  'dice',
  'chess-board',
  'chess',
  'puzzle-piece',
  'book',
  'book-open',
  'graduation-cap',
  'music',
  'masks-theater',
  'dungeon',
  'wand-sparkles',
  'ghost',
  'cat',
  'dog',
  'paw',
  'frog',
  'fish-fins',
  'hippo',
  'kiwi-bird',
  'dragon',
  'crow',
  'feather',
  'poo',
  'heart',
  'cloud',
  'sun',
  'rainbow',
  'bolt',
  'snowflake',
  'moon',
  'meteor',
  'user-astronaut',
];
const projectColors = [
  '#50BFD5', // main blue
  '#E36D28', // main orange
  '#e0c600', // main yellow
  '#573CB9', // main violet
  '#57B279', // green
  '#DE4D86', // green
  '#685044', // brown
];

export function ProjectIllustrationMaker({
  illustration,
  setIllustration,
  iconContainerClassName,
  colorContainerClassName,
  className,
}: ProjectIllustrationMakerProps): JSX.Element {
  const illustrationCurrent = illustration ? illustration : defaultProjectIllustration;
  return (
    <Flex direction='column' align='stretch' className={className}>
      <div className={cx(css({marginTop: space_S}), colorContainerClassName)}>
        <label className={labelStyle}>Color</label>
        <CirclePicker
          colors={projectColors}
          onChangeComplete={c => setIllustration({ ...illustrationCurrent, iconBkgdColor: c.hex })}
          color={illustrationCurrent.iconBkgdColor}
          width={'auto'}
          className={css({ marginTop: space_S, padding: space_S })}
        />
      </div>
      <div className={cx(css({marginTop: space_S}))}>
        <label className={labelStyle}>Icon</label>
        <ProjectIconPicker
          bgColor={illustrationCurrent.iconBkgdColor}
          iconActive={illustrationCurrent.iconKey}
          onChange={i => setIllustration({ ...illustrationCurrent, iconKey: i })}
          className={iconContainerClassName}
        />
      </div>
    </ Flex>
  );
}

interface ProjectIconPickerProps {
  bgColor: string;
  iconActive: string;
  onChange: (icon: IconName) => void;
  className?: string;
}
function ProjectIconPicker({ bgColor, iconActive, onChange, className }: ProjectIconPickerProps): JSX.Element {
  return (
    <>
      <div
        className={cx(css({
          display: 'grid',
          gridGap: space_M,
          gridTemplateColumns: 'repeat(auto-fit, 50px)',
          gap: space_M,
          flexWrap: 'wrap',
          backgroundColor: bgColor,
          padding: space_M,
          maxHeight: '140px',
          overflow: 'auto',
          cursor: 'default',
          marginTop: space_S,
          borderRadius: borderRadius,
          minWidth: '200px',
        }), className)}
      >
        {projectIconsSolid.map(i => (
          <IconButton
            key={i}
            title={i}
            icon={{prefix: "fas", iconName: i}}
            iconSize={'2x'}
            onClick={() => onChange(i)}
            className={css({
              color: 'var(--bgColor)',
              textAlign: 'center',
              opacity: iconActive === i ? 0.5 : 1,
              ':hover': {
                color: 'var(--bgColor)',
                opacity: 0.5,
              },
            })}
          />
        ))}
      </div>
    </>
  );
}
