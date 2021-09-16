/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { checkedIcon, uncheckedIcon } from '../styling/defaultIcons';
import IconButton from './IconButton';

export interface CheckBoxProps {
  label?: string;
  value: boolean | null | undefined;
  onChange: () => void;
}

export default function CheckBox({ label, value, onChange }: CheckBoxProps): JSX.Element {
  return (
    <IconButton icon={value ? checkedIcon : uncheckedIcon} onClick={onChange}>
      {label}
    </IconButton>
  );
}
