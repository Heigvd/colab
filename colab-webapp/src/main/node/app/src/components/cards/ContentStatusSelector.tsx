/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import CardContentStatus, { CardContentStatusType } from './CardContentStatus';

type Status = CardContent['status'];

function buildOption(status: CardContentStatusType) {
  return {
    value: status,
    label: <CardContentStatus status={status || 'NONE'} mode="full" />,
  };
}

const options = [
  buildOption('NONE'),
  buildOption('ACTIVE'),
  buildOption('VALIDATED'),
  buildOption('TO_VALIDATE'),
  buildOption('ARCHIVED'),
  buildOption('REJECTED'),
];

export default function ContentStatusSelector({
  self,
  onChange,
}: {
  self: Status;
  onChange: (status: Status) => void;
}): JSX.Element {
  const onChangeCb = React.useCallback(
    (option: { value: Status | 'NONE' } | null) => {
      if (option != null) {
        if (option.value === 'NONE') {
          onChange(null);
        } else {
          onChange(option.value);
        }
      } else {
        onChange(null);
      }
    },
    [onChange],
  );

  return (
    <Select
      className={css({ minWidth: '240px' })}
      options={options}
      value={buildOption(self || 'NONE')}
      onChange={onChangeCb}
    />
  );
}
