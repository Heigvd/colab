/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import Button from './Button';

// not used anymore

interface ConfirmWrapperProps {
  onConfirm: () => void;
  message: string;
}

export function ConfirmWrapper({ onConfirm, message }: ConfirmWrapperProps): JSX.Element {
  return (
    <>
      <div>{message}</div>
      <Button onClick={onConfirm}>Confirm</Button>
    </>
  );
}
