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

export interface Props<T, IsMulti extends boolean> {
  label?: React.ReactNode;
  value?: T;
  options: Opt<T>[];
  warning?: React.ReactNode;
  error?: React.ReactNode;
  mandatory?: boolean;
  onChange: (newValue: ValueType<T, IsMulti>) => void;
  placeholder?: string;
  tip?: TipsProps['children'];
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
  tip,
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
    <Flex
      className={cx(css({ padding: space_S + ' 0' }), className)}
      direction="column"
      align="stretch"
    >
      <Flex justify="space-between">
        <div>
          <span className={labelStyle}>{label}</span>
          {tip && <Tips>{tip}</Tips>}
          {mandatory ? ' * ' : null}
        </div>
      </Flex>
      {canCreateOption ? (
        <Creatable
          isMulti={isMulti}
          placeholder={placeholder}
          value={currentValue}
          options={options}
          onChange={onInternalChangeCb}
          isDisabled={readonly}
          menuPortalTarget={document.body}
          openMenuOnClick
          openMenuOnFocus
          isClearable
          formatCreateLabel={(inputValue: string) => (
            <div className={cx(selectCreatorStyle, textSmall)}>
              <FontAwesomeIcon icon={faPlus} /> {' Create "' + inputValue + '"'}
            </div>
          )}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 9999 }),
            menu: base => ({ ...base, marginTop: '0px' }),
            container: base => ({ ...base, textAlign: 'initial' }),
            option: base => ({ ...base, fontSize: '.9em' })
          }}
        />
      ) : (
        <Select
          isMulti={isMulti}
          placeholder={placeholder}
          value={currentValue}
          options={options}
          onChange={onInternalChangeCb}
          isDisabled={readonly}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: base => ({ ...base, zIndex: 9999 }),
            menu: base => ({ ...base, marginTop: '0px' }),
            container: base => ({ ...base, textAlign: 'initial' }),
          }}
        />
      )}
      {warning ? <div className={cx(textSmall, warningStyle)}>{warning}</div> : null}
      {error ? <div className={cx(textSmall, errorStyle)}>{error}</div> : null}
    </Flex>
  );
}
