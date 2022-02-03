/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Account, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useCurrentUser, useCurrentUserAccounts } from '../../selectors/userSelector';
import { shallowEqual, useAppSelector } from '../../store/hooks';
import Flex from '../common/Flex';
import { SecondLevelLink } from '../common/Link';
import Tips from '../common/Tips';
import { space_L } from '../styling/style';
import DisplaySettings from './DisplaySettings';
import LocalAccount from './LocalAccount';
import UserProfile from './UserProfile';
import UserSessions from './UserSessions';

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

export default function Settings(): JSX.Element {
  const accounts = useCurrentUserAccounts();
  const { currentUser } = useCurrentUser();

  if (currentUser && accounts != 'LOADING') {
    return (
      <div className={css({ padding: space_L })}>
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
            <SecondLevelLink to="display">Display Settings</SecondLevelLink>
            <SecondLevelLink to="sessions">Active Sessions</SecondLevelLink>
            <span>
              add account{' '}
              <Tips tipsType="TODO">
                One user may have one to many accounts. (AAI, wegas, github, ...)
              </Tips>
            </span>
            <span>...</span>
          </nav>
          <Flex>
            <Routes>
              <Route path="/" element={<span>select something...</span>} />
              <Route path="user" element={<UserProfile user={currentUser} />} />
              <Route path="sessions" element={<UserSessions user={currentUser} />} />
              <Route path="display" element={<DisplaySettings />} />
              <Route path="account/:id" element={<WrapLocalAccountEditor />} />
            </Routes>
          </Flex>
        </div>
      </div>
    );
  } else {
    return (
      <div className={css({ padding: space_L })}>
        <i>You must be authenticated</i>
      </div>
    );
  }
}
