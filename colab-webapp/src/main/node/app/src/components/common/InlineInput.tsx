/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import logger from '../../logger';
import { lightIconButtonStyle, space_S } from '../styling/style';
import Flex from './Flex';
import IconButton from './IconButton';

const inputEditingStyle = css({
  borderBottom: '2px solid var(--darkGray)',
  '&:focus': {
    outline: 'none',
  },
});
const textareaEditingStyle = css({
  borderRadius: '5px',
  padding: space_S,
  border: '1px solid var(--darkGray)',
  '&:focus': {
    outline: 'none',
  },
});
const inlineInputStyle = css({
  '&:hover': {
    opacity: 0.7,
  },
  '&:focus': {
    outline: 'none',
  },
});

const textareaButtonStyle = css({
 flexDirection : 'column',
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
  textClassName?: string;
  autosave?: boolean;
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
  textClassName,
  readOnly,
  placeholder,
  inputType = 'input',
  autosave = true,
}: Props): JSX.Element {
  const spanRef = React.useRef<HTMLSpanElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
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

  const saveCb = React.useCallback(() => {
    if (spanRef.current) {
      onChange(spanRef.current.innerText);
    }
    setMode('DISPLAY');
  }, [onChange, spanRef]);

  const cancelCb = React.useCallback(() => {
    if (spanRef.current != null) {
      spanRef.current.innerText = defaultValue;
    }
    setMode('DISPLAY');
  }, [value, defaultValue]);

  const editCb = React.useCallback(() => {
    if(!readOnly) {
      setMode('EDIT');
    }
    
  }, []);

  const onInputCb = React.useCallback((e: React.ChangeEvent<HTMLSpanElement>) => {
    if(autosave){
      onChange(e.target.innerText);
    }
  }, []);

  return (
    <div ref={containerRef} className={cx(className, css({display: 'flex'}), {[textareaButtonStyle]: inputType === 'textarea'})}>
      {label && label}
      <span
        ref={spanRef}
        onClick={editCb}
        onInput={onInputCb}
        contentEditable={!readOnly}
        spellCheck={false}
        className={cx(
          mode === 'EDIT'
            ? inputType === 'textarea'
              ? cx(textareaEditingStyle, textClassName)
              : cx(inputEditingStyle, textClassName)
            : cx(inlineInputStyle, textClassName),
        )}
      />
      {mode === 'EDIT' && !autosave && !readOnly && (
        <Flex justify='flex-end'>
          <IconButton icon={faTimes} title="Cancel" onClick={cancelCb} className={lightIconButtonStyle}/>
          <IconButton icon={faCheck} title="Save" onClick={saveCb} className={lightIconButtonStyle}/>
        </Flex>
      )}
    </div>
  );
}
