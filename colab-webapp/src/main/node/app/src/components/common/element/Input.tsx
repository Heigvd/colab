/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import {
  br_full,
  br_md,
  disabledStyle,
  errorTextStyle,
  inputStyle,
  labelStyle,
  lightIconButtonStyle,
  space_sm,
  textareaStyle,
  text_sm,
  warningTextStyle,
} from '../../styling/style';
import Flex from '../layout/Flex';
import IconButton from './IconButton';
import Tips, { TipsProps } from './Tips';

// TODO replace OnConfirmInput
// TODO replace input in invite member in Team.tsx

// See for ON_CONFIRM what happens in saveMode === 'ON_CONFIRM' when click outside. do we lose ? => TODO save instead of cancel
// See for ON_CONFIRM if value is updated => stay in edit mode

// TODO see if internalValue is really useful

// Note : still need some UI improvements for some combinations
// Just add what is needed when we need it

interface InputProps {
  label?: React.ReactNode;
  value?: string | number; // TODO  HTMLInputElement['value'] | HTMLTextAreaElement['value'];
  placeholder?: HTMLInputElement['placeholder'] | HTMLTextAreaElement['placeholder'];
  inputType?: 'input' | 'textarea'; // not sure if could better be two distincts components
  type?: HTMLInputElement['type'];
  mandatory?: boolean;
  readOnly?: HTMLInputElement['readOnly'] | HTMLTextAreaElement['readOnly'];
  autoComplete?: HTMLInputElement['autocomplete'] | HTMLTextAreaElement['autocomplete'];
  autoFocus?: HTMLInputElement['autofocus'] | HTMLTextAreaElement['autofocus'];
  min?: HTMLInputElement['min'];
  max?: HTMLInputElement['max'];
  step?: HTMLInputElement['step'];
  rows?: HTMLTextAreaElement['rows'];
  autoWidth?: boolean;
  maxWidth?: string;
  /**
   * saveMode explanation
   * - SILLY_FLOWING : call "onChange" on every input change. the data must not be updatable from the outside
   * - ON_BLUR : call "onChange" only when leaving the field
   * - ON_CONFIRM : call "onChange" only when press Enter or confirm button
   * - DEBOUNCED : call "onChange" on every input change, but deal with update of values from the outside. See if needed to implement it
   */
  saveMode: 'SILLY_FLOWING' | 'ON_BLUR' | 'ON_CONFIRM'; // | 'DEBOUNCED';
  onChange: (newValue: string) => void;
  onCancel?: () => void;
  tip?: TipsProps['children'];
  footer?: React.ReactNode;
  warningMessage?: React.ReactNode;
  errorMessage?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputDisplayClassName?: string;
  inputEditClassName?: string;
  bottomClassName?: string;
  footerClassName?: string;
  validationClassName?: string;
  title?: string;
}

const confirmButtonsStyle = css({
  display: 'inline-flex',
});

function Input({
  label,
  value: initialValue = '',
  placeholder,
  inputType = 'input',
  type = 'text',
  mandatory,
  readOnly,
  autoComplete,
  autoFocus,
  min,
  max,
  step,
  rows,
  autoWidth,
  maxWidth = '100%',
  saveMode,
  onChange,
  onCancel,
  tip,
  footer,
  warningMessage,
  errorMessage,
  containerClassName,
  labelClassName,
  inputDisplayClassName,
  inputEditClassName,
  bottomClassName,
  footerClassName,
  validationClassName,
  title,
}: InputProps): JSX.Element {
  const i18n = useTranslations();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  // Note : we use the references to have direct access the last up-to-date value

  // const containerRef = React.useRef<HTMLDivElement>(null);

  const [currentInternalValue, setCurrentInternalValue] = React.useState<string | number>('');
  const [mode, setMode] = React.useState<'DISPLAY' | 'EDIT'>('DISPLAY');

  // the field can resize itself automatically
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

  // when value changes, use it as current value
  React.useEffect(() => {
    if (inputType === 'input' && inputRef.current != null) {
      inputRef.current.value = String(initialValue);
    }
    if (inputType === 'textarea' && textareaRef.current != null) {
      textareaRef.current.value = String(initialValue);
    }

    setCurrentInternalValue(initialValue);

    updateSize();
  }, [inputType, initialValue, updateSize]);

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
      inputRef.current.value = String(initialValue);
      inputRef.current.blur();
    }
    if (inputType === 'textarea' && textareaRef.current != null) {
      textareaRef.current.value = String(initialValue);
      textareaRef.current.blur();
    }

    setCurrentInternalValue(initialValue);

    updateSize();

    if (onCancel) {
      onCancel();
    }
  }, [inputType, inputRef, textareaRef, initialValue, updateSize, onCancel]);

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

      if (saveMode === 'SILLY_FLOWING') {
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

  const updated = currentInternalValue !== initialValue;

  return (
    <Flex
      direction="column"
      className={cx(containerClassName, { [disabledStyle]: readOnly })}
      style={{ maxWidth: maxWidth }}
      title={title}
    >
      {/* //</Flex> <Flex theRef={containerRef} direction='column'> */}
      {label && (
        <Flex align="center">
          <span className={cx(labelStyle, labelClassName)}>{label}</span>
          {tip && <Tips>{tip}</Tips>}
          {mandatory && ' * '}
          {/* {updated && (
              <span className={cx(textSmall, warningStyle, css({ paddingLeft: space_S }))}>
                {i18n.common.updated}
              </span>
            )} */}
        </Flex>
      )}
      {inputType === 'input' ? (
        <input
          ref={inputRef}
          value={currentInternalValue}
          placeholder={placeholder}
          type={type}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          min={min}
          max={max}
          step={step}
          onFocus={setEditMode}
          onInput={updateSize}
          onChange={changeInternal}
          onKeyDown={pressEnterKey}
          onBlur={() => {
            setDisplayMode();
            if (saveMode === 'ON_BLUR') {
              save();
            }
          }}
          className={cx(
            inputEditClassName && mode === 'EDIT' ? inputEditClassName : inputDisplayClassName,
            css({ color: 'var(--fgColor)' }),
          )}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={currentInternalValue}
          placeholder={placeholder}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          rows={rows}
          onFocus={setEditMode}
          onChange={changeInternal}
          onBlur={() => {
            setDisplayMode();
            if (saveMode === 'ON_BLUR') {
              save();
            }
          }}
          // no onKeyDown here, or it will be a problem to put any end of line in the text
          className={cx(
            inputEditClassName && mode === 'EDIT' ? inputEditClassName : inputDisplayClassName,
          )}
        />
      )}
      {saveMode === 'ON_CONFIRM' && (mode === 'EDIT' || updated) && (
        <Flex className={confirmButtonsStyle}>
          <IconButton
            icon={'close'}
            title={i18n.common.cancel}
            onClick={cancel}
            className={lightIconButtonStyle}
          />
          <IconButton
            icon={'check'}
            title={i18n.common.save}
            onClick={save}
            className={lightIconButtonStyle}
          />
        </Flex>
      )}
      {/* {!label && (
          <Flex justify="space-between">
            <div>
              {tip && <Tips>{tip}</Tips>}
              {mandatory && ' * '}
            </div>
          </Flex>
        )} 
      </Flex> */}
      {(footer || warningMessage || errorMessage) && (
        <Flex direction="column" grow="1" align="flex-start" className={bottomClassName}>
          {footer && <Flex className={cx(text_sm, footerClassName)}>{footer}</Flex>}
          {(warningMessage || errorMessage) && (
            <Flex direction="column" grow="1" className={cx(text_sm, validationClassName)}>
              {warningMessage != null && <div className={warningTextStyle}>{warningMessage}</div>}
              {errorMessage != null && <div className={errorTextStyle}>{errorMessage}</div>}
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
          padding: space_sm + ' 0',
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
  borderRadius: br_full,
  padding: space_sm,
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
});

const inlineTextAreaStyle = {
  borderRadius: br_md,
  padding: space_sm,
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
});

const inlineInputHoverStyle = css({
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
        { [inlineInputHoverStyle]: !props.readOnly },
        props.inputDisplayClassName,
      )}
      inputEditClassName={cx(
        props.inputType === 'input' ? inlineInputEditingStyle : inlineTextareaEditingStyle,
        props.inputEditClassName ? props.inputEditClassName : props.inputDisplayClassName,
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

// Fine tuned inputs *******************************************************************************

export function DiscreetInput(props: Omit<InputProps, 'saveMode' | 'autoWidth'>): JSX.Element {
  return <InlineInput {...props} autoWidth saveMode="ON_BLUR" />;
}

export function DiscreetTextArea(props: Omit<InputProps, 'saveMode' | 'inputType'>): JSX.Element {
  return <InlineInput {...props} inputType="textarea" saveMode="ON_BLUR" />;
}

export function LabeledInput(props: Omit<InputProps, 'saveMode' | 'inputType'>): JSX.Element {
  return <BlockInput {...props} inputType="input" saveMode="ON_BLUR" />;
}

export function LabeledTextArea(props: Omit<InputProps, 'saveMode' | 'inputType'>): JSX.Element {
  return <BlockInput {...props} inputType="textarea" saveMode="ON_BLUR" />;
}

export function FormInput(props: Omit<InputProps, 'saveMode'>): JSX.Element {
  return <BlockInput {...props} saveMode="SILLY_FLOWING" />;
}
