/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { inputStyle, smallInputStyle } from '../styling/style';
import Flex from './Flex';
import IconButton from './IconButton';
import WithToolbar from './WithToolbar';

export interface Props {
  className?: string;
  label?: string;
  value: string;
  readOnly?: boolean;
  size?: 'SMALL' | 'LARGE';
  onChange: (newValue: string) => void;
  placeholder?: string;
}

export default function OnBlurInput({
  className,
  label,
  value,
  onChange,
  size = 'LARGE',
  placeholder = 'no value',
  readOnly = false,
}: Props): JSX.Element {
  const [state, setState] = React.useState<string>(value || '');

  const [mode, setMode] = React.useState<'DISPLAY' | 'EDIT'>('DISPLAY');

  const editCb = React.useCallback(() => {
    setMode('EDIT');
  }, []);

  const displayCb = React.useCallback(() => {
    setMode('DISPLAY');
  }, []);

  React.useEffect(() => {
    setState(value);
  }, [value]);

  const onInternalChangeCb = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setState(newValue);
  }, []);

  const onInternalBlurCb = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    },
    [onChange],
  );

  if (mode === 'EDIT') {
    return (
      <Flex className={className}>
        <div>{label}</div>
        <input
          className={size === 'LARGE' ? inputStyle : smallInputStyle}
          placeholder={placeholder}
          value={state}
          onChange={onInternalChangeCb}
          onBlur={onInternalBlurCb}
        />
        <IconButton icon={faTimes} title="stop edition" onClick={displayCb} />
      </Flex>
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
          {state ? state : <i>{placeholder}</i>}
        </>
      </WithToolbar>
    );
  }
}
