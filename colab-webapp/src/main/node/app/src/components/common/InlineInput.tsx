/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCheck, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import logger from '../../logger';
import Flex from './Flex';
import IconButton from './IconButton';
import WithToolbar from './WithToolbar';

export interface Props {
  label?: string;
  value: string;
  readOnly?: boolean;
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
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
  onChange,
  className,
  readOnly,
  placeholder = '',
}: Props): JSX.Element {
  const spanRef = React.useRef<HTMLSpanElement>(null);

  const defaultValue = getEffectiveValue(value, placeholder);

  React.useEffect(() => {
    logger.trace('InlineInput effect');
    if (spanRef.current != null) {
      logger.trace('InlineInput effect set span => ', defaultValue);
      if (spanRef.current.innerText !== defaultValue) {
        spanRef.current.innerText = defaultValue;
      }
    }
  }, [spanRef, value, defaultValue]);

  const [mode, setMode] = React.useState<'DISPLAY' | 'EDIT'>('DISPLAY');
  const [currentValue, setCurrentValue] = React.useState(value || '');

  //  const onChangeCb = React.useCallback((value: string) => {
  //    setCurrentValue(value);
  //  }, []);

  const saveCb = React.useCallback(() => {
    if (spanRef.current) {
      onChange(spanRef.current.innerText);
    }
    setMode('DISPLAY');
  }, [onChange, spanRef]);

  const cancelCb = React.useCallback(() => {
    setCurrentValue(value);
    if (spanRef.current != null) {
      spanRef.current.innerText = defaultValue;
    }
    setMode('DISPLAY');
  }, [value, defaultValue]);

  const updated = currentValue !== defaultValue;

  const editCb = React.useCallback(() => {
    setMode('EDIT');
  }, []);

  const onInputCb = React.useCallback((e: React.ChangeEvent<HTMLSpanElement>) => {
    //onChange(e.target.innerText);
    setCurrentValue(e.target.innerText);
  }, []);

  return (
    <WithToolbar
      toolbarPosition="RIGHT_MIDDLE"
      toolbarClassName=""
      offsetY={0.5}
      grow={0}
      toolbar={
        <>
          {!readOnly && mode === 'DISPLAY' ? (
            <IconButton icon={faPen} title="edit" onClick={editCb} />
          ) : null}
          {mode === 'EDIT' && updated ? (
            <>
              <IconButton icon={faCheck} onClick={saveCb} />
              <IconButton icon={faTimes} onClick={cancelCb} />
            </>
          ) : null}
        </>
      }
    >
      <Flex className={className}>
        <span ref={spanRef} onInput={onInputCb} contentEditable={mode === 'EDIT'} />
      </Flex>
    </WithToolbar>
  );
}
