/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import React from 'react';
import { iconButtonStyle, p_xs } from '../../styling/style';
import DropDownMenu, { Entry, entryStyle } from '../common/layout/DropDownMenu';
import { IconSize } from '../common/layout/Icon';
import CardContentStatusDisplay from './CardContentStatusDisplay';

const buttonStyle = css({
  '&:hover': {
    outline: '1px solid var(--divider-main)',
  },
});

const disabledStyle = css({
  pointerEvents: 'none',
  opacity: 0.6,
});

type StatusType = CardContent['status'] | null;

const options: StatusType[] = [null, 'ACTIVE', 'TO_VALIDATE', 'VALIDATED', 'REJECTED', 'ARCHIVED'];

interface StatusDropDownProps {
  value: StatusType;
  readOnly?: boolean;
  onChange: (status: StatusType) => void;
  kind?: 'icon_only' | 'outlined' | 'solid';
  iconSize?: keyof typeof IconSize;
}

export default function StatusDropDown({
  value,
  readOnly, // implement me !
  onChange,
  kind = 'outlined',
  iconSize,
}: StatusDropDownProps): JSX.Element {
  const entries = buildEntryForOptions(onChange);
  return (
    <DropDownMenu
      buttonLabel={
        <CardContentStatusDisplay
          kind={kind}
          status={value}
          showEmpty
          iconSize={iconSize}
          className={css({ backgroundColor: 'transparent' })}
        />
      }
      valueComp={{ value: '', label: '' }}
      buttonClassName={cx(iconButtonStyle, p_xs, readOnly ? disabledStyle : buttonStyle)}
      entries={entries}
    />
  );
}

export function StatusSubDropDownEntry({
  mainLabel,
  onChange,
}: {
  mainLabel: string;
  onChange: (status: StatusType) => void;
}): JSX.Element {
  return (
    <DropDownMenu
      icon="keyboard_double_arrow_left"
      buttonLabel={mainLabel}
      entries={buildEntryForOptions(onChange)}
      idleHoverStyle="BACKGROUND"
      className={css({ alignItems: 'stretch' })}
      buttonClassName={entryStyle}
      direction="left"
    />
  );
}

function buildEntryForOptions(onChange: (Status: StatusType) => void): Entry<string>[] {
  return options.map(option => {
    return {
      value: option as string,
      label: (
        <CardContentStatusDisplay
          kind={'outlined'}
          status={option}
          showEmpty
          className={css({ flexGrow: 1 })}
        />
      ),
      action: () => {
        onChange(option ?? null);
      },
    };
  });
}
