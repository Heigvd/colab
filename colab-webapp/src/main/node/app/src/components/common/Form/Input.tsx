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
import Flex from '../Flex';

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
  className?: string;
  readonly?: boolean;
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
  readonly = false,
}: Props): JSX.Element {
  const [state, setState] = React.useState<string>(value || '');

  React.useEffect(() => {
    setState(value);
  }, [value]);

  const onInternalChangeCb = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      setState(newValue);
    },
    [onChange],
  );

  return (
    <Flex
      className={cx(css({ padding: space_S + ' 0' }), className)}
      direction="column"
      align="normal"
    >
      <Flex justify="space-between">
        <div className={labelStyle}>
          {label}
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
          readOnly={readonly}
        />
      ) : (
        <textarea
          className={textareaStyle}
          placeholder={placeholder}
          value={state || ''}
          onChange={onInternalChangeCb}
          readOnly={readonly}
        />
      )}
      {warning ? <div className={cx(textSmall, warningStyle)}>{warning}</div> : null}
      {error ? <div className={cx(textSmall, errorStyle)}>{error}</div> : null}
    </Flex>
  );
}
