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

export interface Props {
  label?: React.ReactNode;
  inputType?: 'input' | 'textarea';
  warning?: React.ReactNode;
  error?: React.ReactNode;
  value?: string;
  mandatory?: boolean;
  type?: HTMLInputElement['type'];
  onChange: (newValue: string) => void;
  placeholder?: string;
  tip?: TipsProps['children'];
  className?: string;
  readonly?: boolean;
  delay?: number;
  autofocus?: boolean;
}

export default function Input({
  type = 'text',
  label,
  inputType = 'input',
  warning,
  error,
  value = '',
  onChange,
  mandatory,
  className,
  placeholder,
  autofocus,
  tip,
  readonly = false,
  delay = 500,
}: Props): JSX.Element {
  const [state, setState] = React.useState<string>(value || '');

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
  const onInternalChangeCb = React.useCallback(
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
  const onBlurCb = React.useCallback(() => {
    debouncedOnChange.flush();
  }, [debouncedOnChange]);

  return (
    <Flex
      className={cx(css({ padding: space_S + ' 0' }), className)}
      direction="column"
      align="normal"
    >
      <Flex justify="space-between">
        <div>
          <span className={labelStyle}>{label}</span>
          {tip && <Tips>{tip}</Tips>}
          {mandatory ? ' * ' : null}
        </div>
      </Flex>
      {inputType === 'input' ? (
        <input
          type={type}
          className={inputStyle}
          placeholder={placeholder}
          value={state || ''}
          onChange={onInternalChangeCb}
          onBlur={onBlurCb}
          readOnly={readonly}
          autoFocus={autofocus}
        />
      ) : (
        <textarea
          className={textareaStyle}
          placeholder={placeholder}
          value={state || ''}
          onChange={onInternalChangeCb}
          onBlur={onBlurCb}
          readOnly={readonly}
          autoFocus={autofocus}
        />
      )}
      {warning ? <div className={cx(textSmall, warningStyle)}>{warning}</div> : null}
      {error ? <div className={cx(textSmall, errorStyle)}>{error}</div> : null}
    </Flex>
  );
}
