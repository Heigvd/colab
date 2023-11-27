/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { iconButtonStyle, p_xs } from '../../styling/style';
import DropDownMenu from '../common/layout/DropDownMenu';
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

type StatusType = CardContent['status'];

const options: (StatusType | null)[] = [
  null,
  'ACTIVE',
  'TO_VALIDATE',
  'VALIDATED',
  'REJECTED',
  'ARCHIVED',
];

interface StatusDropDownProps {
  value: StatusType;
  readOnly?: boolean;
  onChange: (status: StatusType) => void;
  kind?: 'icon_only' | 'outlined' | 'solid';
}

export default function StatusDropDown({
  value,
  readOnly, // implement me !
  onChange,
  kind = 'outlined',
}: StatusDropDownProps): JSX.Element {
  const entries = options.map(option => {
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
      action: () => onChange(option ?? null),
    };
  });
  return (
    <DropDownMenu
      buttonLabel={<CardContentStatusDisplay kind={kind} status={value} showEmpty />}
      valueComp={{ value: '', label: '' }}
      buttonClassName={cx(iconButtonStyle, p_xs, readOnly ? disabledStyle : buttonStyle)}
      entries={entries}
    />
  );
}
