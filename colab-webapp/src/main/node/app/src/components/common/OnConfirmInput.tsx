/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import {
  inputStyle,
  invertedButtonStyle,
  lightIconButtonStyle,
  smallInputStyle,
  space_S,
} from '../styling/style';
import Button from './Button';
import Flex from './Flex';
import IconButton from './IconButton';

export interface Props {
  label?: string;
  okButtonLabel?: string;
  value: string;
  readOnly?: boolean;
  onChange: (newValue: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  directEdit?: boolean;
  size?: 'SMALL' | 'LARGE';
  className?: string;
  cancelButtonLabel?: string;
  buttonsClassName?: string;
  containerClassName?: string;
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

export default function OnConfirmInput({
  className,
  label,
  value,
  onChange,
  onCancel,
  size = 'LARGE',
  placeholder = 'no value',
  readOnly = false,
  directEdit,
  okButtonLabel = 'Save',
  cancelButtonLabel = 'Cancel',
  buttonsClassName,
  containerClassName,
}: Props): JSX.Element {
  const [state, setState] = React.useState<string>(value || '');

  const [mode, setMode] = React.useState<'DISPLAY' | 'EDIT'>((directEdit && 'EDIT') || 'DISPLAY');

  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLInputElement>(null);
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

  const editCb = React.useCallback(() => {
    setMode('EDIT');
  }, []);

  const saveCb = React.useCallback(() => {
    if (inputRef.current) {
      onChange(inputRef.current.value);
    }
    if (!directEdit) {
      setMode('DISPLAY');
    }
  }, [onChange, directEdit]);

  const cancelCb = React.useCallback(() => {
    setState(defaultValue);
    if (!directEdit) {
      setMode('DISPLAY');
    }
    if (onCancel) {
      onCancel();
    }
  }, [defaultValue, directEdit, onCancel]);

  React.useEffect(() => {
    setState(value);
  }, [value]);

  const onInternalChangeCb = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setState(newValue);
  }, []);

  if (mode === 'EDIT' && !readOnly) {
    return (
      <div ref={containerRef} className={containerClassName}>
        <Flex className={className}>
          <div>{label}</div>
          <input
            className={size === 'LARGE' ? inputStyle : smallInputStyle}
            placeholder={placeholder}
            value={state}
            onChange={onInternalChangeCb}
            ref={inputRef}
          />
        </Flex>
        <Flex justify="flex-end" align="center">
          <Button className={cx(invertedButtonStyle, buttonsClassName)} onClick={cancelCb}>
            {cancelButtonLabel}
          </Button>
          <Button className={cx(css({ margin: space_S }), buttonsClassName)} onClick={saveCb}>
            {okButtonLabel}
          </Button>
        </Flex>
      </div>
    );
  } else {
    return (
      <>
        <Flex>
          <label>{label}</label>
          <span
            className={className}
            onClick={() => {
              if (!readOnly) {
                editCb();
              }
            }}
          >
            {state ? state : <i>{placeholder}</i>}
          </span>
          {!readOnly && (
            <IconButton
              icon={faPen}
              title="edit"
              onClick={editCb}
              className={lightIconButtonStyle}
            />
          )}
        </Flex>
      </>
    );
  }
}
