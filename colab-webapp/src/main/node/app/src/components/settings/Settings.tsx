/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { useCurrentUser, useCurrentUserAccounts } from '../../selectors/userSelector';
import Button from '../common/element/Button';
import Tips from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import Debugger from '../debugger/debugger';
import { space_L } from '../styling/style';
import DisplaySettings from './DisplaySettings';
import LocalAccount from './LocalAccount';
import UserProfile from './UserProfile';
import UserSessions from './UserSessions';

export default function Settings(): JSX.Element {
  const accounts = useCurrentUserAccounts();
  const { currentUser } = useCurrentUser();

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  if (currentUser && accounts != 'LOADING') {
    return (
      <div className={css({ padding: space_L })}>
        <h2>Settings</h2>
        <Tabs>
          <Tab name="User Profile" label="User">
            <Flex direction="row" className={css({ gap: space_L })}>
              <UserProfile user={currentUser} />
              {accounts.map(account => {
                if (account.id != null && +account.id >= 0) {
                  return (
                    <>
                      <LocalAccount accountId={account.id} />
                    </>
                  );
                }
              })}
              <div>
                <Button clickable={false} invertedButton>
                  add account
                </Button>
                <Tips tipsType="TODO">
                  One user may have one to many accounts. (AAI, wegas, github, ...)
                </Tips>
              </div>
            </Flex>
          </Tab>
          <Tab name="Display" label="Display">
            <DisplaySettings />
          </Tab>
          <Tab name="activeSess" label="Active Sessions">
            <UserSessions user={currentUser} />
          </Tab>
          <Tab name="debugger" label="Debugger" invisible={!currentUser.admin}>
            <Debugger />
          </Tab>
        </Tabs>
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
