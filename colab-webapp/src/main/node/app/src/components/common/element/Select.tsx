/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import ReactSelect, { StylesConfig } from 'react-select';

/**
 * Drop down to select between values
 */

// -------------------------------------------------------------------------------------------------
// types

interface ItemType<T> {
  value: T;
  label: React.ReactNode;
}

// -------------------------------------------------------------------------------------------------
// main component

interface SelectProps<T> {
  options: T[];
  buildOption: (value: T) => ItemType<T>;
  value: T;
  placeholder?: React.ReactNode;
  readOnly?: boolean;
  canBeNull?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (newValue: any) => void;
  className?: string;
  styles?: StylesConfig;
}

export default function Select<T>({
  options,
  buildOption,
  value,
  placeholder,
  readOnly = false,
  canBeNull = false,
  onChange,
  className,
  styles,
}: SelectProps<T>): JSX.Element {
  return (
    <ReactSelect
      options={options.map(opt => buildOption(opt))}
      value={buildOption(value)}
      placeholder={placeholder}
      isDisabled={readOnly}
      isClearable={canBeNull}
      onChange={onChange}
      className={className}
      styles={styles}
    />
  );
}
