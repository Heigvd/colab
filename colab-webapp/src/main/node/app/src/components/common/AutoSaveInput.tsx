/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';
import * as React from 'react';
import { invisibleInputStyle, invisibleTextareaStyle } from '../styling/style';
import IconButton from './IconButton';
import WithToolbar from './WithToolbar';

type State = {
  status: 'EDIT' | 'DISPLAY';
  currentValue: string;
};

export interface Props {
  label?: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  inputType?: 'INPUT' | 'TEXTAREA';
  readOnly?: boolean;
  delay?: number;
  className?: string;
}

export default function AutoSaveInput({
  label,
  value,
  onChange,
  placeholder = 'no value',
  inputType = 'INPUT',
  delay = 500,
  readOnly = false,
  className,
}: Props): JSX.Element {
  const [state, setState] = React.useState<State>({
    status: 'DISPLAY',
    currentValue: value || '',
  });

  const dropRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: Event) => {
    if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
      displayCb();
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  React.useEffect(() => {
    setState(s => ({ ...s, currentValue: value }));
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
      setState(state => ({ ...state, currentValue: newValue }));
    },
    [debouncedOnChange],
  );
  const onEnter = (event: React.KeyboardEvent) => {
    if(event.key == "Enter") {
      displayCb();
    }
  }

  const editCb = React.useCallback(() => {
    setState(state => ({ ...state, status: 'EDIT' }));
  }, []);

  const displayCb = React.useCallback(() => {
    setState(state => ({ ...state, status: 'DISPLAY' }));
  }, []);

  if (state.status === 'EDIT') {
    return (
      <div ref={dropRef}>
        <label>
          {label}
          {inputType === 'INPUT' ? (
            <input
              placeholder={placeholder}
              value={state.currentValue}
              onChange={onInternalChangeCb}
              autoFocus
              className={cx(invisibleInputStyle, (className || ''))}
              onKeyPress={onEnter}
            />
          ) : (
            <textarea
              placeholder={placeholder}
              value={state.currentValue}
              onChange={onInternalChangeCb}
              autoFocus
              className={cx(invisibleTextareaStyle, (className || ''))}
              onKeyPress={onEnter}
            />
          )}
        </label>
      </div>
    );
  } else {
    return (
      <WithToolbar
        toolbarPosition="RIGHT_MIDDLE"
        toolbarClassName=""
        offsetY={0.5}
        grow={0}
        toolbar={!readOnly ? <IconButton icon={faPen} title="edit" /> : null}
        onClick={editCb}
      >
        <>
          <label>{label}</label>
          <div className={cx(css({'&:hover': { opacity: 0.7 } }), (className || ''))}>
            {state.currentValue ? state.currentValue : <i>{placeholder}</i>}
          </div>
        </>
      </WithToolbar>
    );
  }
}
