/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import Select, { MultiValue, OnChangeValue, SingleValue } from 'react-select';
import Creatable from 'react-select/creatable';
import {
  errorStyle,
  labelStyle,
  selectCreatorStyle,
  space_S,
  textSmall,
  warningStyle,
} from '../../styling/style';
import Flex from '../Flex';
import Tips, { TipsProps } from '../Tips';

interface Opt<T> {
  label: string;
  value: T;
}

type ValueType<T, IsMulti> = IsMulti extends true ? T[] : T | undefined;

interface SelectInputProps<T, IsMulti extends boolean> {
  label?: React.ReactNode;
  value?: T;
  placeholder?: string;
  mandatory?: boolean;
  readOnly?: boolean;
  isMulti: IsMulti;
  canCreateOption?: boolean;
  options: Opt<T>[];
  onChange: (newValue: ValueType<T, IsMulti>) => void;
  tip?: TipsProps['children'];
  fieldFooter?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
}

export default function SelectInput<T, IsMulti extends boolean>({
  label,
  value,
  placeholder = 'no value',
  mandatory,
  readOnly = false,
  isMulti,
  canCreateOption = false,
  options,
  onChange,
  tip,
  fieldFooter,
  warning,
  error,
  className,
}: SelectInputProps<T, IsMulti>): JSX.Element {
  const [state, setState] = React.useState<T | undefined>(value);
  const currentValue = options.find(o => o.value === state);

  React.useEffect(() => {
    setState(value);
  }, [value]);

  const onInternalChange = React.useCallback(
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
    <Flex
      direction="column"
      align="stretch"
      className={cx(css({ padding: space_S + ' 0' }), className)}
    >
      <Flex justify="space-between">
        <div>
          <span className={labelStyle}>{label}</span>
          {tip != null && <Tips>{tip}</Tips>}
          {mandatory && ' * '}
        </div>
      </Flex>
      {canCreateOption ? (
        <Creatable
          value={currentValue}
          placeholder={placeholder}
          isDisabled={readOnly}
          isMulti={isMulti}
          options={options}
          isClearable
          menuPortalTarget={document.body}
          openMenuOnClick
          openMenuOnFocus
          onChange={onInternalChange}
          formatCreateLabel={(inputValue: string) => (
            <div className={cx(selectCreatorStyle, textSmall)}>
              <FontAwesomeIcon icon={faPlus} /> {' Create "' + inputValue + '"'}
            </div>
          )}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 9999 }),
            menu: base => ({ ...base, marginTop: '0px' }),
            container: base => ({ ...base, textAlign: 'initial' }),
            option: base => ({ ...base, fontSize: '.9em' }),
          }}
        />
      ) : (
        <Select
          value={currentValue}
          placeholder={placeholder}
          isDisabled={readOnly}
          isMulti={isMulti}
          options={options}
          onChange={onInternalChange}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 9999 }),
            menu: base => ({ ...base, marginTop: '0px' }),
            container: base => ({ ...base, textAlign: 'initial' }),
          }}
        />
      )}
      {fieldFooter != null && <div className={cx(textSmall)}>{fieldFooter}</div>}
      {warning != null && <div className={cx(textSmall, warningStyle)}>{warning}</div>}
      {error != null && <div className={cx(textSmall, errorStyle)}>{error}</div>}
    </Flex>
  );
}
