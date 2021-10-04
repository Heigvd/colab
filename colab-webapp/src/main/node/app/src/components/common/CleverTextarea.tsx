/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as LiveHelper from '../../LiveHelper';
import logger from '../../logger';

export interface Props {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
}

/**
 * Get new selection rang by applying offsets to current selection
 */
function computeSelectionOffsets(offsets: LiveHelper.Offsets, node: HTMLTextAreaElement) {
  const startIndex = node.selectionStart;
  const endIndex = node.selectionEnd;

  const newRange = {
    start: startIndex,
    end: endIndex,
  };
  logger.trace('Move selection ', startIndex, ':', endIndex, ' according to offsets: ', offsets);

  for (const sKey in offsets) {
    const key = +sKey;
    const offset = offsets[key]!;
    if (key < startIndex) {
      newRange.start += offset;
    }
    if (key < endIndex) {
      newRange.end += offset;
    }
  }

  logger.trace('New Range: ', newRange);
  return newRange;
}

/**
 * Managed textarea which try to keep selected text accros updates
 */
export default function CleverTextarea({ value, onChange, className }: Props): JSX.Element {
  // use a ref to manage the input directly
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const ta = inputRef.current;
    if (ta != null) {
      if (ta.value !== value) {
        const diff = LiveHelper.getMicroChange(ta.value, value);
        const offsets = LiveHelper.computeOffsets(diff);
        const range = computeSelectionOffsets(offsets, ta);
        ta.value = value;
        ta.selectionStart = range.start;
        ta.selectionEnd = range.end;
      }
    }
  }, [value]);

  const onInternalChangeCb = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <textarea
      className={className}
      ref={inputRef}
      //value={state.value} // no need to provide the value -> handled by the effect
      onChange={onInternalChangeCb}
    />
  );
}
