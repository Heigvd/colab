/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { iconButtonStyle } from '../../styling/style';
import DropDownMenu from '../common/layout/DropDownMenu';
import CardContentStatusDisplay from './CardContentStatusDisplay';

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
  const i18n = useTranslations();

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
      title={i18n.modules.card.settings.title}
      valueComp={{ value: '', label: '' }}
      buttonClassName={iconButtonStyle}
      entries={entries}
    ></DropDownMenu>
  );
}
