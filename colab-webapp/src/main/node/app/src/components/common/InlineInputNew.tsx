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
import logger from '../../logger';
import { borderRadius, lightIconButtonStyle, space_S } from '../styling/style';
import Flex from './Flex';
import IconButton from './IconButton';

const inputEditingStyle = css({
  border: '1px solid var(--darkGray)',
  borderRadius: borderRadius,
  padding: space_S,
  width: 'auto',
  minWidth: '1em',
  '&:focus': {
    outline: 'none',
  },
});
const textareaEditingStyle = css({
  border: '1px solid var(--darkGray)',
  borderRadius: borderRadius,
  padding: space_S,
  '&:focus': {
    outline: 'none',
  },
});
const inlineInputStyle = css({
  border: '1px solid transparent',
  borderRadius: borderRadius,
  padding: space_S,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  width: 'auto',
  minWidth: '1em',
  gridArea: 1 / 2,
  '&:hover': {
    borderColor: 'var(--lightGray)',
  },
  '&:focus': {
    outline: 'none',
  },
});

const textareaButtonStyle = css({
  flexDirection: 'column',
  justifyContent: 'flex-end',
});

export interface Props {
  label?: string;
  value: string;
  readOnly?: boolean;
  onChange: (newValue: string) => void;
  placeholder: string;
  inputType?: 'input' | 'textarea';
  className?: string;
  containerClassName?: string;
  autosave?: boolean;
  delay?: number;
}

function getEffectiveValue(...values: string[]): string {
  for (const i in values) {
    const v = values[i];
    if (v) {
      return v;
    }
  }
  return 'no value';
}

export default function InlineInput({
  value,
  label,
  onChange,
  className,
  containerClassName,
  readOnly = false,
  placeholder,
  inputType = 'input',
  autosave = true,
  delay = 300,
}: Props): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [mode, setMode] = React.useState<'DISPLAY' | 'EDIT'>('DISPLAY');
  const [state, setState] = React.useState<string>(value || '');

  const defaultValue = getEffectiveValue(value, placeholder);

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
  }, [inputRef, value, defaultValue, updateSize]);

  React.useEffect(() => {
    return () => {
      updateSize();
    };
  });
  const saveCb = React.useCallback(() => {
    if (inputRef.current) {
      onChange(inputRef.current.value);
      inputRef.current.blur();
    }
    setMode('DISPLAY');
  }, [onChange, inputRef]);

  const cancelCb = React.useCallback(() => {
    if (inputRef.current != null) {
      inputRef.current.value = defaultValue;
      inputRef.current.blur();
    }
    setMode('DISPLAY');
  }, [defaultValue]);

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
        }
        else
        {
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
        {
          [textareaButtonStyle]: inputType === 'textarea',
        },
        containerClassName,
      )}
    >
      {label && label}
      <input
        ref={inputRef}
        placeholder="untitled"
        value={state}
        onChange={onInternalChangeCb}
        onClick={editCb}
        onKeyDown={onEnterCb}
        onInput={updateSize}
        className={cx(
          mode == 'EDIT'
            ? inputType === 'textarea'
              ? cx(textareaEditingStyle, className)
              : cx(inputEditingStyle, className)
            : cx(inlineInputStyle, className),
        )}
      />
      {mode === 'EDIT' && !autosave && (
        <Flex justify="flex-end">
          <IconButton
            icon={faTimes}
            title="Cancel"
            onClick={cancelCb}
            className={lightIconButtonStyle}
          />
          <IconButton
            icon={faCheck}
            title="Save"
            onClick={saveCb}
            className={lightIconButtonStyle}
          />
        </Flex>
      )}
    </div>
  );
}
