/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { debounce } from 'lodash';
import * as API from '../../../API/api';
import { TextDataBlock } from 'colab-rest-client';

import { useAppDispatch } from '../../../store/hooks';

import { ToastClsMarkdownEditor } from './ToastClsMarkdownEditor';
//import logger from '../../../logger';

export interface MarkdownEditor {
  block: TextDataBlock;
  delay?: number;
}

interface State {
  value: string;
  saving: string | undefined;
}

export function ToastMarkdownEditor({ block, delay = 500 }: MarkdownEditor): JSX.Element {
  const dispatch = useAppDispatch();
  const [state, setState] = React.useState<State>({
    value: block.textData || '',
    saving: undefined,
  });

  React.useEffect(() => {
    // when textData changed
    setState(state => {
      const newState = { ...state };
      if (block.textData === state.saving) {
        // the new value if the one this comp is saving
        newState.saving = undefined;
      } else {
        // this one come from the outside
        newState.value = block.textData || '';
      }
      return newState;
    });
  }, [block, block.textData]);

  const debouncedOnChange = React.useMemo(
    () =>
      debounce((value: string) => {
        dispatch(API.updateBlock({ ...block, textData: value }));
        setState(state => ({ ...state, saving: value }));
      }, delay),
    [delay, block, dispatch],
  );

  const onChange = React.useCallback(
    (value: string) => {
      debouncedOnChange(value);
      //setState(value);
    },
    [debouncedOnChange],
  );

  return <ToastClsMarkdownEditor value={state.value} onChange={onChange} />;
}
