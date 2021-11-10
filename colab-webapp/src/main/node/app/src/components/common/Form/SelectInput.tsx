/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import { errorStyle, inputStyle, labelStyle, warningStyle } from '../../styling/style';
import Flex from '../Flex';

export interface Props<T> {
  label?: React.ReactNode;
  value?: T;
  options: { label: string; value: T }[];
  warning?: string;
  error?: string;
  mandatory?: boolean;
  onChange: (newValue: T | undefined) => void;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
  canCreateOption?: boolean;
}

export default function SelectInput<T>({
  options,
  label,
  warning,
  error,
  value,
  onChange,
  mandatory,
  className,
  placeholder = 'no value',
  readonly = false,
  canCreateOption = false,
}: Props<T>): JSX.Element {
  const [state, setState] = React.useState<T | undefined>(value);
  const currentValue = options.find(o => o.value === state);

  React.useEffect(() => {
    setState(value);
  }, [value]);

  const onInternalChangeCb = React.useCallback(
    (o: { label: string; value: T } | null) => {
      const newValue = o?.value;
      onChange(newValue);
      setState(newValue);
    },
    [onChange],
  );

  return (
    <Flex className={className} direction="column">
      <Flex justify="space-between">
        <div className={labelStyle}>
          {label}
          {mandatory ? ' * ' : null}{' '}
        </div>
        {warning ? <div className={warningStyle}>{warning}</div> : null}
        {error ? <div className={errorStyle}>{error}</div> : null}
      </Flex>
      {canCreateOption ? (
        <Creatable
          className={inputStyle}
          placeholder={placeholder}
          value={currentValue}
          options={options}
          onChange={onInternalChangeCb}
          isDisabled={readonly}
        />
      ) : (
        <Select
          className={inputStyle}
          placeholder={placeholder}
          value={currentValue}
          options={options}
          onChange={onInternalChangeCb}
          isDisabled={readonly}
        />
      )}
    </Flex>
  );
}
