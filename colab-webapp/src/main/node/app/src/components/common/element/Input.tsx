/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import {
  errorStyle,
  inputStyle,
  labelStyle,
  space_S,
  textareaStyle,
  textSmall,
  warningStyle,
} from '../../styling/style';
import Flex from '../layout/Flex';
import Tips, { TipsProps } from './Tips';

// TODO type="number"
// TODO type="range"
// TODO autoSave
// TODO rows
// inline design
// confirm / cancel design

interface InputProps {
  label?: React.ReactNode;
  value?: string | number;
  placeholder?: HTMLInputElement['placeholder'] | HTMLTextAreaElement['placeholder'];
  inputType?: 'input' | 'textarea';
  type?: HTMLInputElement['type'];
  mandatory?: boolean;
  readOnly?: HTMLInputElement['readOnly'] | HTMLTextAreaElement['readOnly'];
  autoFocus?: HTMLInputElement['autofocus'] | HTMLTextAreaElement['autofocus'];
  min?: HTMLInputElement['min'];
  max?: HTMLInputElement['max'];
  //rows?: HTMLTextAreaElement['rows'];
  onChange: (newValue: string) => void; //  | number
  tip?: TipsProps['children'];
  fieldFooter?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  footerClassName?: string;
  validationClassName?: string;
}

function Input({
  label,
  value = '',
  placeholder,
  inputType = 'input',
  type = 'text',
  mandatory,
  readOnly,
  autoFocus,
  min,
  max,
  //rows, // doesn't work ?!?
  onChange,
  tip,
  fieldFooter,
  warning,
  error,
  containerClassName,
  labelClassName,
  inputClassName,
  footerClassName,
  validationClassName,
}: InputProps): JSX.Element {
  const [state, setState] = React.useState<string | number>(value);

  React.useEffect(() => {
    setState(value);
  }, [value]);

  const onInternalChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      setState(newValue);
    },
    [onChange],
  );

  return (
    <Flex className={containerClassName}>
      <Flex justify="space-between">
        <div>
          <span className={cx(labelStyle, labelClassName)}>{label}</span>
          {tip != null && <Tips>{tip}</Tips>}
          {mandatory && ' * '}
        </div>
      </Flex>
      {inputType === 'input' ? (
        <input
          value={state}
          placeholder={placeholder}
          type={type}
          readOnly={readOnly}
          autoFocus={autoFocus}
          min={min}
          max={max}
          onChange={onInternalChange}
          className={cx(inputStyle, inputClassName)}
        />
      ) : (
        <textarea
          value={state}
          placeholder={placeholder}
          readOnly={readOnly}
          autoFocus={autoFocus}
          //rows={rows}
          onChange={onInternalChange}
          className={cx(textareaStyle, inputClassName)}
        />
      )}
      <Flex className={cx(textSmall, footerClassName)}>
        {fieldFooter != null && <div>{fieldFooter}</div>}
      </Flex>
      <Flex className={cx(textSmall, validationClassName)}>
        {warning != null && <div className={warningStyle}>{warning}</div>}
        {error != null && <div className={errorStyle}>{error}</div>}
      </Flex>
    </Flex>
  );
}

export function BlockInput(props: InputProps): JSX.Element {
  return (
    <Input
      {...props}
      containerClassName={css({
        flexDirection: 'column',
        alignItems: 'normal',
        padding: space_S + ' 0',
      })}
      footerClassName={css({
        flexDirection: 'column',
        alignItems: 'normal',
      })}
      validationClassName={css({
        flexDirection: 'column',
        alignItems: 'center',
      })}
    />
  );
}
