/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { SecondLevelLink } from '../common/Link';
import LoggersConfig from './LoggersConfig';
import { AllProjects } from '../projects/ProjectList';
import Who from './Who';
import AllUsers from './AllUsers';

export default (): JSX.Element => {
  return (
    <div>
      <h2>Admin Page</h2>
      <Router basename="/admin">
        <div>
          <nav>
            <SecondLevelLink to="/users">Users</SecondLevelLink>
            <SecondLevelLink to="/projects">Projects</SecondLevelLink>
            <SecondLevelLink to="/loggers">Loggers</SecondLevelLink>
            <SecondLevelLink to="/onlineusers">Online Users</SecondLevelLink>
          </nav>
          <ul>
            <li>Models</li>
            <li>co.LAB Version</li>
            <li>...</li>
          </ul>
          <div>
            <Switch>
              <Route exact path="/">
                <span>select something...</span>
              </Route>
              <Route exact path="/loggers">
                <LoggersConfig />
              </Route>
              <Route exact path="/projects">
                <AllProjects />
              </Route>
              <Route exact path="/users">
                <AllUsers />
              </Route>
              <Route exact path="/onlineusers">
                <Who />
              </Route>
              <Route>
                <Redirect to="/" />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    </div>
  );
};
