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
  borderRadius,
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

// Note : still need some UI improvements for some combinations
// Just add what is needed when we need it

// TODO autoSave
// TODO rows

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
  autoWidth?: boolean;
  saveMode: 'FLOWING' | 'ON_CONFIRM'; //| 'DEBOUNCED' | 'ON_CONFIRM';
  onChange: (newValue: string) => void; //  | number
  onCancel?: () => void;
  tip?: TipsProps['children'];
  footer?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputDisplayClassName?: string;
  inputEditClassName?: string;
  bottomClassName?: string;
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
  autoWidth,
  saveMode,
  onChange,
  onCancel,
  tip,
  footer,
  warning,
  error,
  containerClassName,
  labelClassName,
  inputDisplayClassName,
  inputEditClassName,
  bottomClassName,
  footerClassName,
  validationClassName,
}: InputProps): JSX.Element {
  const i18n = useTranslations();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  // Note : we use the references to have direct access the last up-to-date value

  // const containerRef = React.useRef<HTMLDivElement>(null);

  const [currentInternalValue, setCurrentInternalValue] = React.useState<string | number>();
  const [mode, setMode] = React.useState<'DISPLAY' | 'EDIT'>('DISPLAY');

  const updateSize = React.useCallback(() => {
    if (autoWidth) {
      if (inputRef.current) {
        inputRef.current.style.width = 0 + 'px';
        inputRef.current.style.width = inputRef.current.scrollWidth + 'px';
        if (inputRef.current.value.length === 0) {
          inputRef.current.style.width = inputRef.current.placeholder.length + 'ch';
        }
      }
    }
  }, [autoWidth]);

  React.useEffect(() => {
    if (inputType === 'input' && inputRef.current != null) {
      inputRef.current.value = String(value);
    }
    if (inputType === 'textarea' && textareaRef.current != null) {
      textareaRef.current.value = String(value);
    }

    setCurrentInternalValue(value);

    updateSize();
  }, [inputType, value, updateSize]);

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

    updateSize();

    if (onCancel) {
      onCancel();
    }
  }, [inputType, inputRef, textareaRef, value, updateSize, onCancel]);

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

  const setDisplayMode = React.useCallback(() => {
    setMode('DISPLAY');
  }, []);

  const setEditMode = React.useCallback(() => {
    if (!readOnly) {
      setMode('EDIT');
    }
  }, [readOnly]);

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
      if (event.key === 'Enter') {
        if (saveMode === 'ON_CONFIRM') {
          save();
        }
        if (inputType === 'input' && inputRef.current != null) {
          inputRef.current.blur();
        }
        if (inputType === 'textarea' && textareaRef.current != null) {
          textareaRef.current.blur();
        }
      }
    },
    [saveMode, save, inputType],
  );

  const updated = currentInternalValue !== value;

  return (
    <Flex direction="column">
      <Flex /*theRef={containerRef}*/ className={containerClassName}>
        <Flex justify="space-between">
          <div>
            <span className={cx(labelStyle, labelClassName)}>{label}</span>
            {tip && <Tips>{tip}</Tips>}
            {mandatory && ' * '}
            {/* {updated && (
              <span className={cx(textSmall, warningStyle, css({ paddingLeft: space_S }))}>
                {i18n.common.updated}
              </span>
            )} */}
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
            onFocus={setEditMode}
            onInput={updateSize}
            onChange={changeInternal}
            onKeyDown={pressEnterKey}
            onBlur={setDisplayMode}
            className={cx(
              inputEditClassName && mode === 'EDIT' ? inputEditClassName : inputDisplayClassName,
            )}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={currentInternalValue}
            placeholder={placeholder}
            readOnly={readOnly}
            autoFocus={autoFocus}
            //rows={rows}
            onFocus={setEditMode}
            onChange={changeInternal}
            onBlur={setDisplayMode}
            // no onKeyDown here, or it will be a problem to put any end of line in the text
            className={cx(
              inputEditClassName && mode === 'EDIT' ? inputEditClassName : inputDisplayClassName,
            )}
          />
        )}
        {saveMode === 'ON_CONFIRM' && (mode === 'EDIT' || updated) && (
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
      </Flex>
      {(footer || warning || error) && (
        <Flex direction="column" grow="1" className={cx(css({ width: '100%' }), bottomClassName)}>
          {footer && (
            <Flex className={cx(textSmall, footerClassName)}>
              <div>{footer}</div>
            </Flex>
          )}
          {(warning || error) && (
            <Flex
              direction="column"
              grow="1"
              className={cx(textSmall, css({ width: '100%' }), validationClassName)}
            >
              {warning != null && <div className={warningStyle}>{warning}</div>}
              {error != null && <div className={errorStyle}>{error}</div>}
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
}

// BlockInput **************************************************************************************

export function BlockInput(props: InputProps): JSX.Element {
  return (
    <Input
      {...props}
      containerClassName={cx(
        css({
          flexDirection: 'column',
          alignItems: 'normal',
          padding: space_S + ' 0',
        }),
        props.containerClassName,
      )}
      inputDisplayClassName={cx(
        props.inputType === 'textarea' ? textareaStyle : inputStyle,
        props.inputDisplayClassName,
      )}
      footerClassName={cx(
        css({
          flexDirection: 'column',
          alignItems: 'normal',
        }),
        props.footerClassName,
      )}
      validationClassName={cx(
        css({
          flexDirection: 'column',
          alignItems: 'center',
        }),
        props.validationClassName,
      )}
    />
  );
}

// InlineInput **************************************************************************************

const inlineTextareaContainerStyle = css({
  flexDirection: 'column',
  justifyContent: 'flex-end',
});

const inlineInputStyle = {
  maxWidth: '100%',
  borderRadius: borderRadius,
  padding: space_S,
  width: 'auto',
  minWidth: '1em',
  fontFamily: 'inherit',
  backgroundColor: 'transparent',
  '&:focus': {
    outline: 'none',
  },
};

const inlineInputEditingStyle = css({
  ...inlineInputStyle,
  border: '1px solid var(--darkGray)',
});

const inlineInputDisplayStyle = css({
  ...inlineInputStyle,
  border: '1px solid transparent',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  gridArea: 1 / 2,
  '&:hover': {
    borderColor: 'var(--lightGray)',
  },
});

const inlineTextAreaStyle = {
  borderRadius: borderRadius,
  padding: space_S,
  width: '100%',
  maxWidth: '100%',
  fontFamily: 'inherit',
  backgroundColor: 'transparent',
  '&:focus': {
    outline: 'none',
  },
};

const inlineTextareaEditingStyle = css({
  ...inlineTextAreaStyle,
  border: '1px solid var(--darkGray)',
});

const inlineTextareaDisplayStyle = css({
  ...inlineTextAreaStyle,
  border: '1px solid transparent',
  '&:hover': {
    borderColor: 'var(--lightGray)',
  },
});

export function InlineInput(props: InputProps): JSX.Element {
  return (
    <Input
      {...props}
      containerClassName={cx(
        css({ display: 'flex', alignItems: 'center', position: 'relative' }),
        {
          [inlineTextareaContainerStyle]: props.inputType === 'textarea',
        },
        props.containerClassName,
      )}
      inputDisplayClassName={cx(
        props.inputType === 'input' ? inlineInputDisplayStyle : inlineTextareaDisplayStyle,
        props.inputDisplayClassName,
      )}
      inputEditClassName={cx(
        props.inputType === 'input' ? inlineInputEditingStyle : inlineTextareaEditingStyle,
        props.inputEditClassName,
      )}
      footerClassName={cx(
        css({
          flexDirection: 'column',
          alignItems: 'normal',
        }),
        props.footerClassName,
      )}
      validationClassName={cx(
        css({
          flexDirection: 'column',
          alignItems: 'center',
        }),
        props.validationClassName,
      )}
    />
  );
}
