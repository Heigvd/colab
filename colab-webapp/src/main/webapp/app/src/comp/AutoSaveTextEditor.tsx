/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from "react";
import {debounce} from 'lodash';
import {faPen, faCheck} from "@fortawesome/free-solid-svg-icons";
import {iconStyle} from "./style";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

type State = {
  status: 'EDIT' | 'DISPLAY'
  currentValue: string;
}

export const AutoSaveTextEditor = ({value, onChange}: {value: string, onChange: (newValue: string) => void}) => {

  const [state, setState] = React.useState<State>({
    status: 'DISPLAY',
    currentValue: value || '',
  });

  React.useEffect(() => {
    setState({...state, currentValue: value})
  }, [value])

  const debouncedOnChange = React.useCallback(
    debounce((value: string) => {
      onChange(value);
    }, 1000), []);

  const onInternalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    debouncedOnChange(e.target.value)
    setState(
      {...state, currentValue: e.target.value}
    );
  }
  if (state.status === 'EDIT') {
    return <div>
      <textarea
        value={state.currentValue}
        onChange={onInternalChange}
      />

      <FontAwesomeIcon
        className={iconStyle}
        icon={faCheck}
        onClick={() => {
          setState({
            ...state,
            status: 'DISPLAY'
          });
        }}
      />
    </div>;
  } else {
    return <div>
      {state.currentValue}

      <FontAwesomeIcon
        className={iconStyle}
        icon={faPen}
        onClick={() => {
          setState({
            ...state,
            status: 'EDIT'
          });
        }}
      />
    </div>;
  }
}
