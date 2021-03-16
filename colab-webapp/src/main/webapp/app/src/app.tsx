/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { Suspense } from 'react';
import { render } from 'react-dom';
import { init } from './ws';
import { Provider } from 'react-redux';
import { getStore } from './store';
import ErrorBoundary from './ErrorBoundary';
import MainApp from './comp/MainApp';
import ErrorNotifier from './ErrorNotifier';
import Loading from './Loading';

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
