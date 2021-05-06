/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { debounce } from 'lodash';
import { faPenNib, faTimes } from '@fortawesome/free-solid-svg-icons';
import IconButton from './IconButton';

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
  delay?: number;
}

export default function AutoSaveInput({
  label,
  value,
  onChange,
  placeholder = 'no value',
  inputType = 'INPUT',
  delay = 500,
}: Props): JSX.Element {
  const [state, setState] = React.useState<State>({
    status: 'DISPLAY',
    currentValue: value || '',
  });

  React.useEffect(() => {
    setState(s => ({...s, currentValue: value}));
  }, [value]);

  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const debouncedOnChange = React.useMemo(
    () => debounce((value: string) => {
      onChangeRef.current(value);
    }, delay),
    [delay]
  );

  const onInternalChangeCb = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      debouncedOnChange(newValue);
      setState(state => ({...state, currentValue: newValue}));
    },
    [debouncedOnChange]
  );

  if (state.status === 'EDIT') {
    return (
      <div>
        <label>
          {label}
          {inputType === 'INPUT' ? (
            <input
              placeholder={placeholder}
              value={state.currentValue}
              onChange={onInternalChangeCb} />
          ) : (
            <textarea
              placeholder={placeholder}
              value={state.currentValue}
              onChange={onInternalChangeCb} />
          )}
        </label>

        <IconButton
          icon={faTimes}
          title="stop edition"
          onClick={() => {
            setState({
              ...state,
              status: 'DISPLAY',
            });
          } } />
      </div>
    );
  } else {
    return (
      <div>
        <label>{label}</label>
        {state.currentValue ? state.currentValue : <i>{placeholder}</i>}
        <IconButton
          icon={faPenNib}
          title="edit"
          onClick={() => {
            setState({
              ...state,
              status: 'EDIT',
            });
          } } />
      </div>
    );
  }
};
