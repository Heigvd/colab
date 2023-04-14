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
import CardContentStatusDisplay from './CardContentStatus';

type StatusType = CardContent['status'];

function buildOption(status: StatusType) {
  return {
    value: status,
    label: <CardContentStatusDisplay status={status} mode="full" />,
  };
}

const options = [
  buildOption('ACTIVE'),
  buildOption('TO_VALIDATE'),
  buildOption('VALIDATED'),
  buildOption('ARCHIVED'),
  buildOption('REJECTED'),
];

export default function ContentStatusSelector({
  self,
  onChange,
}: {
  self: StatusType;
  onChange: (status: StatusType) => void;
}): JSX.Element {
  const onChangeCb = React.useCallback(
    (option: { value: StatusType } | null) => {
      if (option != null) {
        onChange(option.value);
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
      value={self ? buildOption(self) : null}
      onChange={onChangeCb}
      isClearable
    />
  );
}
