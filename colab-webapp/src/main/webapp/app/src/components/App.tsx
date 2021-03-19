/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { Suspense } from 'react';
import { render } from 'react-dom';
import { init } from '../ws/websocket';
import { Provider } from 'react-redux';
import { getStore } from '../store/store';
import ErrorBoundary from './common/ErrorBoundary';
import MainApp from './Lobby';
import Loading from './common/Loading';
import ErrorNotifier from './common/ErrorNotifier';

function mount() {
  return render(
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Provider store={getStore()}>
          <ErrorNotifier />
          <MainApp />
        </Provider>
      </Suspense>
    </ErrorBoundary>,
    document.getElementById('root'),
  );
}
init();
mount();
