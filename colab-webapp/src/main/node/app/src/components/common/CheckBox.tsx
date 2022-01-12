/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { checkedIcon, uncheckedIcon } from '../styling/defaultIcons';

export interface CheckBoxProps {
  label?: string;
  value: boolean | null | undefined;
  onChange: () => void;
}

export default function CheckBox({ label, value, onChange }: CheckBoxProps): JSX.Element {
  return (
    <>
      <FontAwesomeIcon icon={value ? checkedIcon : uncheckedIcon} onClick={onChange} />
      {label}
    </>
  );
}
