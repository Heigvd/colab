/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import logger from '../../logger';
import IconButton from './IconButton';

export interface Props {
  label?: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
}

export default function InlineInput({ value, onChange }: Props): JSX.Element {
  const spanRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    logger.trace('InlineInput effect');
    if (spanRef.current != null) {
      logger.trace('InlineInput effect set span => ', value);
      if (spanRef.current.innerText !== value) {
        spanRef.current.innerText = value;
      }
    }
  }, [spanRef, value]);

  const [currentValue, setCurrentValue] = React.useState(value || '');

  //  const onChangeCb = React.useCallback((value: string) => {
  //    setCurrentValue(value);
  //  }, []);

  const saveCb = React.useCallback(() => {
    if (spanRef.current) {
      onChange(spanRef.current.innerText);
    }
  }, [onChange, spanRef]);

  const cancelCb = React.useCallback(() => {
    setCurrentValue(value);
    if (spanRef.current != null) {
      spanRef.current.innerText = value;
    }
  }, [value]);

  const updated = currentValue !== value;

  const onInputCb = React.useCallback((e: React.ChangeEvent<HTMLSpanElement>) => {
    //onChange(e.target.innerText);
    setCurrentValue(e.target.innerText);
  }, []);

  return (
    <div className={css({ display: 'flex' })}>
      <span ref={spanRef} onInput={onInputCb} contentEditable={true} />
      {updated ? (
        <>
          <IconButton icon={faCheck} onClick={saveCb} />
          <IconButton icon={faTimes} onClick={cancelCb} />
        </>
      ) : null}
    </div>
  );
}
