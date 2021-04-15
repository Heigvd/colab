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
import UserList from './UserList';
import { AllProjects } from '../projects/ProjectList';

export default () => {
  return (
    <div>
      <h2>Admin Page</h2>
      <Router basename="/admin">
        <div>
          <nav>
            <SecondLevelLink to="/users">Users</SecondLevelLink>
            <SecondLevelLink to="/projects">Projects</SecondLevelLink>
            <SecondLevelLink to="/loggers">Loggers</SecondLevelLink>
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
                <UserList />
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
