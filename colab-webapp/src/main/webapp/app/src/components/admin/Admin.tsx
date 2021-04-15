/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import {HashRouter as Router, Switch, Route} from 'react-router-dom';
import {SecondLevelLink} from '../common/Link';
import LoggersConfig from './LoggersConfig';

export default () => {
  return (
    <div>
      <h2>Admin Page</h2>
      <Router basename="/admin">
        <div>
          <ul>
            <li>Users</li>
            <li>Projects</li>
            <li>Models</li>
            <SecondLevelLink to="/loggers">Loggers</SecondLevelLink>
            <li>co.LAB Version</li>
            <li>...</li>
          </ul>
          <div>
            <Switch>
              <Route exact path="/">
                <span>select something...</span>
              </Route>
              <Route exact path="/loggers">
                <LoggersConfig  />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    </div>
  );
};
