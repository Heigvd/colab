/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import {HashRouter as Router, Switch, Route, useParams} from 'react-router-dom';
import UserProfile from './UserProfile';
import {SecondLevelLink} from '../common/Link';
import {useAppSelector, useCurrentUser} from '../../store/hooks';
import {entityIs, Account} from 'colab-rest-client';
import LocalAccount from './LocalAccount';

function accountTitle(account: Account) {
  if (entityIs(account, 'LocalAccount')) {
    return `Email Account (${account.email}`;
  }
  return "";
}

/**
 * useParams does not work inline...
 */
function WrapLocalAccountEditor() {
  const id = useParams<{id?: string}>().id;

  if (id != null && +id >= 0) {
    return (
      <LocalAccount accountId={+id} />
    );
  } else {
    return null;
  }
}

export default () => {
  const accounts = useAppSelector((state) =>
    Object.values(state.users.accounts).filter(a =>
      a.userId == state.auth.currentUserId
    )
  );
  const user = useCurrentUser();

  if (user) {
    return (
      <div>
        <h2>Settings</h2>
        <Router basename="/settings">
          <div>
            <ul>
              <li>
                <SecondLevelLink to="/user">User Profile</SecondLevelLink>
              </li>
              {accounts.map(account => {
                return <li>
                  <SecondLevelLink to={`/account/${account.id}`}>{accountTitle(account)}</SecondLevelLink>
                </li>;
              })}
              <li>add account</li>
              <li>...</li>
            </ul>
            <div>
              <Switch>
                <Route exact path="/">
                  <span>select something...</span>
                </Route>
                <Route exact path="/user">
                  <UserProfile user={user} />
                </Route>
                <Route path="/account/:id">
                  <WrapLocalAccountEditor />
                </Route>
              </Switch>
            </div>
          </div>
        </Router>
      </div >
    );
  } else {
    return <div>
      <i>You must be authenticated</i>
    </div>
  }
};
