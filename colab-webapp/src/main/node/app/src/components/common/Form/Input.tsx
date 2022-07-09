/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { debounce } from 'lodash';
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
import Flex from '../Flex';
import Tips, { TipsProps } from '../Tips';

interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, 'label' | 'onChange'> {
  label?: React.ReactNode;
  value?: string | number;
  placeholder?: string;
  type?: HTMLInputElement['type'];
  inputType?: 'input' | 'textarea';
  delay?: number;
  mandatory?: boolean;
  readonly?: boolean;
  onChange: (newValue: string) => void;
  tip?: TipsProps['children'];
  warning?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
}

export default function Input({
  label,
  value = '',
  placeholder,
  type = 'text',
  inputType = 'input',
  delay = 500,
  mandatory,
  readonly = false,
  autoFocus,
  onChange,
  onKeyDown,
  min,
  max,
  tip,
  warning,
  error,
  className,
}: InputProps): JSX.Element {
  const [state, setState] = React.useState<string | number>(value || '');

  React.useEffect(() => {
    setState(value);
  }, [value]);

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const debouncedOnChange = React.useMemo(
    () =>
      debounce((value: string) => {
        onChangeRef.current(value);
      }, delay),
    [delay],
  );

  const onInternalChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      debouncedOnChange(newValue);
      setState(newValue);
    },
    [debouncedOnChange],
  );

  /**
   * Send change immediatly.
   * No need to wait debounced delay
   */
  const onBlur = React.useCallback(() => {
    debouncedOnChange.flush();
  }, [debouncedOnChange]);

  return (
    <Flex
      direction="column"
      align="normal"
      className={cx(css({ padding: space_S + ' 0' }), className)}
    >
      <Flex justify="space-between">
        <div>
          <span className={labelStyle}>{label}</span>
          {tip != null && <Tips>{tip}</Tips>}
          {mandatory && ' * '}
        </div>
      </Flex>
      {inputType === 'input' ? (
        <input
          value={state || ''}
          placeholder={placeholder}
          type={type}
          readOnly={readonly}
          autoFocus={autoFocus}
          onChange={onInternalChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          min={min}
          max={max}
          className={inputStyle}
        />
      ) : (
        <textarea
          value={state || ''}
          placeholder={placeholder}
          readOnly={readonly}
          autoFocus={autoFocus}
          onChange={onInternalChange}
          onBlur={onBlur}
          className={textareaStyle}
        />
      )}
      {warning != null && <div className={cx(textSmall, warningStyle)}>{warning}</div>}
      {error != null && <div className={cx(textSmall, errorStyle)}>{error}</div>}
    </Flex>
  );
}
