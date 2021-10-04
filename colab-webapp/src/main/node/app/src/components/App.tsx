/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { Suspense } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Route, Switch, useParams } from 'react-router-dom';
import { getStore } from '../store/store';
import { init } from '../ws/websocket';
import ErrorBoundary from './common/ErrorBoundary';
import Loading from './common/Loading';
import Notifier from './common/Notifier';
import MainApp from './MainApp';
import Token from './token/Token';

/**
 * To read parameters from hash
 */
function TokenWrapper() {
  const { id, token } = useParams<{ id: string; token: string }>();

  return <Token tokenId={id} token={token} />;
}

function mount() {
  return render(
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Provider store={getStore()}>
          <Notifier />
          <Router>
            <Switch>
              <Route path="/token/:id/:token">
                <TokenWrapper />
              </Route>
              <Route>
                <MainApp />
              </Route>
            </Switch>
          </Router>
        </Provider>
      </Suspense>
    </ErrorBoundary>,
    document.getElementById('root'),
  );
}
init();
mount();
