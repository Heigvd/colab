/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { MaterialIconsType } from '../../../styling/IconType';
import { space_xs } from '../../../styling/style';
import Flex from '../layout/Flex';
import IconButton from './IconButton';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Style

const containerStyle = css({
  overflow: 'auto',
  cursor: 'default',
});

const iconSize = 'md';

function iconStyle(isSelected: boolean, selectionColor: IconPickerProps['selectionColor']) {
  return css({
    margin: space_xs,
    color: isSelected ? 'var(--white)' : 'var(--gray-500)',
    backgroundColor: isSelected ? selectionColor : 'var(--transparent)',
    ':not(:disabled):hover': {
      backgroundColor: `${selectionColor}`,
      color: 'var(--white)',
      opacity: 0.5,
    },
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Component

interface IconPickerProps {
  iconList: MaterialIconsType[];
  selectedIcon: string;
  selectionColor: string;
  onSelect: (icon: MaterialIconsType) => void;
  containerClassName?: string;
}

export default function IconPicker({
  iconList,
  selectedIcon,
  selectionColor,
  onSelect,
  containerClassName,
}: IconPickerProps): JSX.Element {
  return (
    <Flex wrap="wrap" className={cx(containerStyle, containerClassName)}>
      {iconList.map(i => (
        <IconButton
          key={i}
          title={i}
          icon={i}
          iconSize={iconSize}
          onClick={() => onSelect(i)}
          className={iconStyle(selectedIcon === i, selectionColor)}
        />
      ))}
    </Flex>
  );
}
