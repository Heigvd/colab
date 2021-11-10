/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import { Suspense } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter, Route, Routes, useParams } from 'react-router-dom';
import { getStore } from '../store/store';
import { init } from '../ws/websocket';
import ErrorBoundary from './common/ErrorBoundary';
import Loading from './common/Loading';
import Notifier from './common/Notifier';
import MainApp from './MainApp';
import { lightTheme, normalThemeMode } from './styling/style';
import Token from './token/Token';

/**
 * To read parameters from hash
 */
function TokenWrapper() {
  const { id, token } = useParams<'id' | 'token'>();

  return <Token tokenId={id} token={token} />;
}

function mount() {
  return render(
    <div className={cx(lightTheme, normalThemeMode)}>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Provider store={getStore()}>
            <Notifier />
            <HashRouter>
              <Routes>
                <Route path="/token/:id/:token" element={<TokenWrapper />} />
                <Route path="*" element={<MainApp />} />
              </Routes>
            </HashRouter>
          </Provider>
        </Suspense>
      </ErrorBoundary>
    </div>,
    document.getElementById('root'),
  );
}
init();
mount();
