/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import logger from '../../logger';
import { borderRadius, lightIconButtonStyle, space_S } from '../styling/style';
import IconButton from './IconButton';

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

const inputEditingStyle = css({
  ...inlineInputStyle,
  border: '1px solid var(--darkGray)',
});

const inputDisplayStyle = css({
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
const textareaEditingStyle = css({
  ...inlineTextAreaStyle,
  border: '1px solid var(--darkGray)',
});

const textareaStyle = css({
  ...inlineTextAreaStyle,
  border: '1px solid transparent',
  '&:hover': {
    borderColor: 'var(--lightGray)',
  },
});

const textareaContainerStyle = css({
  flexDirection: 'column',
  justifyContent: 'flex-end',
});

const confirmButtonsStyle = css({
  display: 'inline-flex',
});

export interface Props {
  label?: string;
  value: string;
  readOnly?: boolean;
  onChange: (newValue: string) => void;
  onCancel?: () => void;
  placeholder: string;
  inputType?: 'input' | 'textarea';
  className?: string;
  containerClassName?: string;
  autosave?: boolean;
  delay?: number;
  maxWidth?: string;
  autofocus?: boolean;
  rows?: number;
}

export default function InlineInput({
  value,
  label,
  onChange,
  onCancel,
  className,
  containerClassName,
  readOnly = false,
  placeholder,
  inputType = 'input',
  autosave = true,
  delay = 300,
  maxWidth = '100%',
  autofocus,
  rows,
}: Props): JSX.Element {
  const i18n = useTranslations();

  const inputRef = React.useRef<HTMLInputElement>();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [mode, setMode] = React.useState<'DISPLAY' | 'EDIT'>('DISPLAY');
  const [state, setState] = React.useState<string>(value || '');

  const defaultValue = value;

  const handleClickOutside = (event: Event) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      cancelCb();
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  const updateSize = React.useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.width = 0 + 'px';
      inputRef.current.style.width = inputRef.current.scrollWidth + 'px';
      if (inputRef.current.value.length === 0) {
        inputRef.current.style.width = inputRef.current.placeholder.length + 'ch';
      }
    }
  }, []);

  React.useEffect(() => {
    logger.trace('InlineInput effect');
    if (inputRef.current != null) {
      logger.trace('InlineInput effect set span => ', defaultValue);
      if (inputRef.current.value !== defaultValue) {
        inputRef.current.value = defaultValue;
        updateSize();
      }
    }
    if (textareaRef.current !== null) {
      if (textareaRef.current.value !== defaultValue) {
        textareaRef.current.value = defaultValue;
      }
    }
  }, [inputRef, textareaRef, value, defaultValue, updateSize]);

  const saveCb = React.useCallback(() => {
    if (inputType === 'input' && inputRef.current) {
      onChange(inputRef.current.value);
      inputRef.current.blur();
    }
    if (inputType === 'textarea' && textareaRef.current) {
      onChange(textareaRef.current.value);
      textareaRef.current.blur();
    }
    setMode('DISPLAY');
  }, [onChange, inputRef, textareaRef, inputType]);

  const cancelCb = React.useCallback(() => {
    if (inputType === 'input' && inputRef.current != null) {
      inputRef.current.value = defaultValue;
      inputRef.current.blur();
      if (onCancel) onCancel();
    }
    if (inputType === 'textarea' && textareaRef.current != null) {
      textareaRef.current.value = defaultValue;
      textareaRef.current.blur();
    }
    setMode('DISPLAY');
  }, [defaultValue, textareaRef, inputType, onCancel]);

  const editCb = React.useCallback(() => {
    if (!readOnly) {
      setMode('EDIT');
    }
  }, [readOnly]);

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
      setState(newValue);
      if (autosave) {
        debouncedOnChange(newValue);
      }
    },
    [autosave, debouncedOnChange],
  );

  const onEnterCb = React.useCallback(
    e => {
      if (e.key === 'Enter') {
        if (!autosave) {
          saveCb();
        } else {
          if (inputRef.current) inputRef.current.blur();
          setMode('DISPLAY');
        }
      }
    },
    [autosave, saveCb],
  );

  return (
    <div
      ref={containerRef}
      className={cx(
        css({ display: 'flex', alignItems: 'center', position: 'relative' }),
        {
          [textareaContainerStyle]: inputType === 'textarea',
        },
        containerClassName,
      )}
      style={{ maxWidth: maxWidth }}
    >
      {label && label}
      {inputType === 'input' ? (
        <input
          ref={ref => {
            if (ref) {
              inputRef.current = ref;
              updateSize();
            }
          }}
          placeholder={placeholder}
          value={state}
          readOnly={readOnly}
          onChange={onInternalChangeCb}
          onClick={editCb}
          onKeyDown={onEnterCb}
          onInput={updateSize}
          className={cx(
            mode == 'EDIT' ? cx(inputEditingStyle, className) : cx(inputDisplayStyle, className),
          )}
          autoFocus={autofocus}
        />
      ) : (
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={state}
          readOnly={readOnly}
          onChange={onInternalChangeCb}
          onClick={editCb}
          className={cx(
            mode == 'EDIT' ? cx(textareaEditingStyle, className) : cx(textareaStyle, className),
          )}
          autoFocus={autofocus}
          rows={rows}
        />
      )}

      {mode === 'EDIT' && !autosave && (
        <div
          className={cx(
            { [css({ alignSelf: 'flex-end' })]: inputType === 'textarea' },
            confirmButtonsStyle,
          )}
        >
          <IconButton
            icon={faTimes}
            title={i18n.common.cancel}
            onClick={cancelCb}
            className={lightIconButtonStyle}
          />
          <IconButton
            icon={faCheck}
            title="Save"
            onClick={saveCb}
            className={lightIconButtonStyle}
          />
        </div>
      )}
    </div>
  );
}
