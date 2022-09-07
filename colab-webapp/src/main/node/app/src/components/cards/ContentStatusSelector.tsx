/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import CardContentStatus from './CardContentStatus';

type Status = CardContent['status'];

function buildOption(status: Status) {
  return {
    value: status,
    label: <CardContentStatus status={status} mode="full" />,
  };
}

const options = [
  buildOption('ACTIVE'),
  buildOption('POSTPONED'),
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
    (option: { value: Status } | null) => {
      if (option != null) {
        onChange(option.value);
      }
    },
    [onChange],
  );

  return (
    <Select
      className={css({ minWidth: '240px' })}
      options={options}
      value={buildOption(self)}
      onChange={onChangeCb}
      menuPortalTarget={document.body}
    />
  );
}
