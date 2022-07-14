/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import {
  errorStyle,
  inputStyle,
  labelStyle,
  lightIconButtonStyle,
  space_S,
  textareaStyle,
  textSmall,
  warningStyle,
} from '../../styling/style';
import Flex from '../layout/Flex';
import IconButton from './IconButton';
import Tips, { TipsProps } from './Tips';

// TODO type="range"
// TODO autoSave
// TODO rows
// TODO inline design
// TODO mode edit / display
// TODO auto fit width
// TODO enter when on confirm

// TODO see what happens in saveMode === 'ON_CONFIRM' when click outside. do we lose ?

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
  saveMode: 'FLOWING' | 'ON_CONFIRM'; //| 'DEBOUNCED' | 'ON_CONFIRM';
  onChange: (newValue: string) => void; //  | number
  onCancel?: () => void;
  tip?: TipsProps['children'];
  footer?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  footerClassName?: string;
  validationClassName?: string;
}

const confirmButtonsStyle = css({
  display: 'inline-flex',
});

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
  saveMode,
  onChange,
  onCancel,
  tip,
  footer,
  warning,
  error,
  containerClassName,
  labelClassName,
  inputClassName,
  footerClassName,
  validationClassName,
}: InputProps): JSX.Element {
  const i18n = useTranslations();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  // Note : we use the references to have direct access the last up-to-date value

  // const containerRef = React.useRef<HTMLDivElement>(null);

  const [currentInternalValue, setCurrentInternalValue] = React.useState<string | number>();

  React.useEffect(() => {
    setCurrentInternalValue(value);
  }, [value]);

  // const handleClickOutside = (event: Event) => {
  //   if (containerRef.current != null && !containerRef.current.contains(event.target as Node)) {
  //     cancel();
  //   }
  // };

  // React.useEffect(() => {
  //   document.addEventListener('click', handleClickOutside, true);
  //   return () => {
  //     document.removeEventListener('click', handleClickOutside, true);
  //   };
  // });

  const save = React.useCallback(() => {
    if (inputType === 'input' && inputRef.current != null) {
      onChange(inputRef.current.value);
      inputRef.current.blur();
    }
    if (inputType === 'textarea' && textareaRef.current != null) {
      onChange(textareaRef.current.value);
      textareaRef.current.blur();
    }
  }, [inputType, inputRef, textareaRef, onChange]);

  const cancel = React.useCallback(() => {
    if (inputType === 'input' && inputRef.current != null) {
      inputRef.current.value = String(value);
      inputRef.current.blur();
    }
    if (inputType === 'textarea' && textareaRef.current != null) {
      textareaRef.current.value = String(value);
      textareaRef.current.blur();
    }

    setCurrentInternalValue(value);

    if (onCancel) {
      onCancel();
    }
  }, [inputType, inputRef, textareaRef, value, onCancel]);

  const changeInternal = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setCurrentInternalValue(newValue);

      if (saveMode === 'FLOWING') {
        onChange(newValue);
      }
    },
    [saveMode, onChange],
  );

  const pressEnterKey = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (saveMode === 'ON_CONFIRM') {
        if (event.key === 'Enter') {
          save();
          if (inputType === 'input' && inputRef.current != null) {
            inputRef.current.blur();
          }
          if (inputType === 'textarea' && textareaRef.current != null) {
            textareaRef.current.blur();
          }
        }
      }
    },
    [saveMode, save, inputType],
  );

  return (
    <Flex /*theRef={containerRef}*/ className={containerClassName}>
      <Flex justify="space-between">
        <div>
          <span className={cx(labelStyle, labelClassName)}>{label}</span>
          {tip && <Tips>{tip}</Tips>}
          {mandatory && ' * '}
          {currentInternalValue !== value && (
            <span className={cx(textSmall, warningStyle, css({ paddingLeft: space_S }))}>
              {i18n.common.updated}
            </span>
          )}
        </div>
      </Flex>
      {inputType === 'input' ? (
        <input
          ref={inputRef}
          value={currentInternalValue}
          placeholder={placeholder}
          type={type}
          readOnly={readOnly}
          autoFocus={autoFocus}
          min={min}
          max={max}
          onChange={changeInternal}
          onKeyDown={pressEnterKey}
          className={cx(inputStyle, inputClassName)}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={currentInternalValue}
          placeholder={placeholder}
          readOnly={readOnly}
          autoFocus={autoFocus}
          //rows={rows}
          onChange={changeInternal}
          // no onKeyDown here, or it will be a problem to put any end of line in the text
          className={cx(textareaStyle, inputClassName)}
        />
      )}
      {saveMode === 'ON_CONFIRM' && (
        <Flex className={confirmButtonsStyle}>
          <IconButton
            icon={faTimes}
            title={i18n.common.cancel}
            onClick={cancel}
            className={lightIconButtonStyle}
          />
          <IconButton
            icon={faCheck}
            title={i18n.common.save}
            onClick={save}
            className={lightIconButtonStyle}
          />
        </Flex>
      )}
      {footer != null && (
        <Flex className={cx(textSmall, footerClassName)}>
          <div>{footer}</div>
        </Flex>
      )}
      {(warning != null || error != null) && (
        <Flex className={cx(textSmall, validationClassName)}>
          {warning != null && <div className={warningStyle}>{warning}</div>}
          {error != null && <div className={errorStyle}>{error}</div>}
        </Flex>
      )}
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
