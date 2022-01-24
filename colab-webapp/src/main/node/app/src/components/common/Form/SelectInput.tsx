/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Select, { MultiValue, OnChangeValue, SingleValue } from 'react-select';
import Creatable from 'react-select/creatable';
import { errorStyle, labelStyle, warningStyle } from '../../styling/style';
import Flex from '../Flex';

interface Opt<T> {
  label: string;
  value: T;
}

type ValueType<T, IsMulti> = IsMulti extends true ? T[] : T | undefined;

export interface Props<T, IsMulti extends boolean> {
  label?: React.ReactNode;
  value?: T;
  options: Opt<T>[];
  warning?: React.ReactNode;
  error?: React.ReactNode;
  mandatory?: boolean;
  onChange: (newValue: ValueType<T, IsMulti>) => void;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
  isMulti: IsMulti;
  canCreateOption?: boolean;
}

export default function SelectInput<T, IsMulti extends boolean>({
  options,
  label,
  warning,
  error,
  value,
  onChange,
  mandatory,
  className,
  isMulti,
  placeholder = 'no value',
  readonly = false,
  canCreateOption = false,
}: Props<T, IsMulti>): JSX.Element {
  const [state, setState] = React.useState<T | undefined>(value);
  const currentValue = options.find(o => o.value === state);

  React.useEffect(() => {
    setState(value);
  }, [value]);

  const onInternalChangeCb = React.useCallback(
    (data: OnChangeValue<{ label: string; value: T }, IsMulti>) => {
      if (isMulti) {
        const v = (data as MultiValue<Opt<T>>).map(o => o.value);
        onChange(v as ValueType<T, IsMulti>);
      } else if (data != null) {
        const v = data as SingleValue<Opt<T>>;
        if (v != null) {
          onChange(v.value as ValueType<T, IsMulti>);
        }
      }
      return undefined;
    },
    [isMulti, onChange],
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
          isMulti={isMulti}
          placeholder={placeholder}
          value={currentValue}
          options={options}
          onChange={onInternalChangeCb}
          isDisabled={readonly}
        />
      ) : (
        <Select
          isMulti={isMulti}
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
