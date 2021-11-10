/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Account, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useCurrentUser } from '../../selectors/userSelector';
import { shallowEqual, useAppSelector } from '../../store/hooks';
import { SecondLevelLink } from '../common/Link';
import LocalAccount from './LocalAccount';
import UserProfile from './UserProfile';

function accountTitle(account: Account) {
  if (entityIs(account, 'LocalAccount')) {
    return `Edit email Account (${account.email})`;
  }
  return '';
}

/**
 * useParams does not work inline...
 */
function WrapLocalAccountEditor() {
  const { id } = useParams<'id'>();

  if (id != null && +id >= 0) {
    return <LocalAccount accountId={+id} />;
  } else {
    return null;
  }
}

export default (): JSX.Element => {
  const accounts = useAppSelector(
    state => Object.values(state.users.accounts).filter(a => a.userId == state.auth.currentUserId),
    shallowEqual,
  );
  const { currentUser } = useCurrentUser();

  if (currentUser) {
    return (
      <div>
        <h2>Settings</h2>
        <div>
          <nav>
            <SecondLevelLink to="user">User Profile</SecondLevelLink>
            {accounts.map(account => {
              return (
                <SecondLevelLink key={`account-${account.id}`} to={`account/${account.id}`}>
                  {accountTitle(account)}
                </SecondLevelLink>
              );
            })}
            <span>add account</span>
            <span>...</span>
          </nav>
          <div>
            <Routes>
              <Route path="/" element={<span>select something...</span>} />
              <Route path="user" element={<UserProfile user={currentUser} />} />
              <Route path="account/:id" element={<WrapLocalAccountEditor />} />
            </Routes>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <i>You must be authenticated</i>
      </div>
    );
  }
};
