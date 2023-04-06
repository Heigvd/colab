/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Select, { MultiValue, OnChangeValue, SingleValue } from 'react-select';
import Creatable from 'react-select/creatable';
import useTranslations from '../../../i18n/I18nContext';
import {
  disabledStyle,
  errorTextStyle,
  labelStyle,
  space_sm,
  text_sm,
  warningTextStyle,
} from '../../../styling/style';
import Flex from '../layout/Flex';
import Icon from '../layout/Icon';
import Tips, { TipsProps } from './Tips';

interface Opt<T> {
  label: string;
  value: T;
}

type ValueType<T, IsMulti> = IsMulti extends true ? T[] : T | undefined;

interface SelectInputProps<T, IsMulti extends boolean> {
  label?: React.ReactNode;
  value?: T;
  placeholder?: React.ReactNode;
  mandatory?: boolean;
  readOnly?: boolean;
  isClearable: boolean;
  isMulti: IsMulti;
  canCreateOption?: boolean;
  options: Opt<T>[];
  onChange: (newValue: ValueType<T, IsMulti> | null) => void;
  tip?: TipsProps['children'];
  footer?: React.ReactNode;
  warningMessage?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
  bottomClassName?: string;
}

export default function SelectInput<T, IsMulti extends boolean>({
  label,
  value,
  placeholder,
  mandatory,
  readOnly = false,
  isClearable,
  isMulti,
  canCreateOption = false,
  options,
  onChange,
  tip,
  footer,
  warningMessage,
  errorMessage,
  className,
  bottomClassName,
}: SelectInputProps<T, IsMulti>): JSX.Element {
  const i18n = useTranslations();

  const currentValue = React.useMemo(() => {
    return options.find(o => o.value === value);
  }, [value, options]);

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
      } else {
        onChange(null);
      }

      return undefined;
    },
    [isMulti, onChange],
  );

  return (
    <Flex
      direction="column"
      align="stretch"
      className={cx(css({ padding: space_sm + ' 0' }), className, { [disabledStyle]: readOnly })}
    >
      <Flex justify="space-between">
        <div>
          <span className={labelStyle}>{label}</span>
          {tip != null && <Tips>{tip}</Tips>}
          {mandatory && ' * '}
        </div>
      </Flex>
      <Flex direction="column" className={text_sm} align="stretch">
        {canCreateOption ? (
          <Creatable
            value={currentValue}
            placeholder={placeholder || i18n.basicComponent.selectInput.selectOrCreate}
            isDisabled={readOnly}
            isMulti={isMulti}
            options={options}
            isClearable={isClearable && !isMulti}
            menuPortalTarget={document.body}
            onChange={onInternalChange}
            noOptionsMessage={() => {
              return i18n.basicComponent.selectInput.noItemTypeToCreate;
            }}
            formatCreateLabel={(inputValue: string) => (
              <div className={cx(text_sm)}>
                <Icon icon={'add'} />
                {i18n.basicComponent.selectInput.create(inputValue)}
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
            placeholder={placeholder || i18n.basicComponent.selectInput.select}
            isDisabled={readOnly}
            isMulti={isMulti}
            options={options}
            isClearable={isClearable && !isMulti}
            menuPortalTarget={document.body}
            onChange={onInternalChange}
            noOptionsMessage={() => {
              return i18n.basicComponent.selectInput.noMatch;
            }}
            styles={{
              menuPortal: base => ({ ...base, zIndex: 9999 }),
              menu: base => ({ ...base, marginTop: '0px' }),
              container: base => ({ ...base, textAlign: 'initial' }),
              option: base => ({ ...base, fontSize: '.9em' }),
            }}
          />
        )}
      </Flex>
      {footer != null && <div className={text_sm}>{footer}</div>}
      <Flex direction="column" align="center" className={cx(text_sm, bottomClassName)}>
        {warningMessage != null && <div className={warningTextStyle}>{warningMessage}</div>}
        {errorMessage != null && <div className={errorTextStyle}>{errorMessage}</div>}
      </Flex>
    </Flex>
  );
}
