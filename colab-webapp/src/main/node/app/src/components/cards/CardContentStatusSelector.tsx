/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import Select from '../common/element/Select';
import CardContentStatusDisplay from './CardContentStatusDisplay';

/**
 * Drop down selector for card content status
 */

// -------------------------------------------------------------------------------------------------
// types

type StatusType = CardContent['status'];

// -------------------------------------------------------------------------------------------------
// main component

interface ContentStatusSelectorProps {
  value: StatusType;
  readOnly?: boolean;
  onChange: (status: StatusType) => void;
}

export default function ContentStatusSelector({
  value,
  readOnly,
  onChange,
}: ContentStatusSelectorProps): JSX.Element {
  const onChangeCb = React.useCallback(
    (option: { value: StatusType } | null) => {
      onChange(option?.value ?? null);
    },
    [onChange],
  );

  return (
    <Select<StatusType>
      options={options}
      buildOption={buildOption}
      value={value}
      readOnly={readOnly}
      onChange={onChangeCb}
      styles={{
        control: baseStyle => ({
          ...baseStyle,
          visibility: 'hidden',
          '&:hover ': {
            visibility: 'visible',
          },
        }),
        valueContainer: baseStyle => ({
          ...baseStyle,
          visibility: 'visible',
        }),
        option: (baseStyle, state) => ({
          ...baseStyle,
          // prevents from having strong color for the selected item
          backgroundColor: state.isSelected ? 'unset' : baseStyle.backgroundColor,
        }),
        menu: baseStyle => ({
          ...baseStyle,
          // so it fits the items
          width: 'unset',
        }),
      }}
    />
  );
}

// -------------------------------------------------------------------------------------------------
// sub components

const options: (StatusType | null)[] = [
  null,
  'ACTIVE',
  'TO_VALIDATE',
  'VALIDATED',
  'REJECTED',
  'ARCHIVED',
];

function buildOption(status: StatusType | null) {
  return {
    value: status,
    label: <CardContentStatusDisplay kind="outlined" status={status} showEmpty />,
  };
}
