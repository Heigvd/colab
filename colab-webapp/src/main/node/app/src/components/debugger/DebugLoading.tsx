/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { useLoadingState } from '../../store/hooks';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import InlineLoading from '../common/element/InlineLoading';

export default function DebugLoading(): JSX.Element {
  const {
    isLoading: isLoading1,
    startLoading: startLoading1,
    stopLoading: stopLoading1,
  } = useLoadingState();
  const {
    isLoading: isLoading2,
    startLoading: startLoading2,
    stopLoading: stopLoading2,
  } = useLoadingState();

  return (
    <>
      <div>loading animation</div>
      <InlineLoading />
      <div>loading icon (loading on click)</div>
      <IconButton
        icon={'draft'}
        title="loading test"
        isLoading={isLoading1}
        onClick={() => {
          startLoading1();
          setTimeout(() => {
            stopLoading1();
          }, 2000);
        }}
      />
      <div>loading button (loading on click)</div>
      <Button
        icon="draft"
        onClick={() => {
          startLoading2();
          setTimeout(() => {
            stopLoading2();
          }, 2000);
        }}
        isLoading={isLoading2}
      >
        TEST LOADING
      </Button>
    </>
  );
}
