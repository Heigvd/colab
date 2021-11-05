/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';
import * as React from 'react';
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
}

export default function AutoSaveInput({
  label,
  value,
  onChange,
  placeholder = 'no value',
  inputType = 'INPUT',
  delay = 500,
  readOnly = false,
}: Props): JSX.Element {
  const [state, setState] = React.useState<State>({
    status: 'DISPLAY',
    currentValue: value || '',
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

  const editCb = React.useCallback(() => {
    setState(state => ({ ...state, status: 'EDIT' }));
  }, []);

  const displayCb = React.useCallback(() => {
    setState(state => ({ ...state, status: 'DISPLAY' }));
  }, []);

  if (state.status === 'EDIT') {
    return (
      <div>
        <label>
          {label}
          {inputType === 'INPUT' ? (
            <input
              placeholder={placeholder}
              value={state.currentValue}
              onChange={onInternalChangeCb}
            />
          ) : (
            <textarea
              placeholder={placeholder}
              value={state.currentValue}
              onChange={onInternalChangeCb}
            />
          )}
        </label>

        <IconButton icon={faTimes} title="stop edition" onClick={displayCb} />
      </div>
    );
  } else {
    return (
      <WithToolbar
        toolbarPosition="RIGHT_MIDDLE"
        toolbarClassName=""
        offsetY={0.5}
        grow={0}
        toolbar={!readOnly ? <IconButton icon={faPen} title="edit" onClick={editCb} /> : null}
      >
        <>
          <label>{label}</label>
          {state.currentValue ? state.currentValue : <i>{placeholder}</i>}
        </>
      </WithToolbar>
    );
  }
}
