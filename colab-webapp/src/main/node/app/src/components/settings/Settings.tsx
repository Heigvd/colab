/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../../i18n/I18nContext';
import { useCurrentUser, useCurrentUserAccounts } from '../../selectors/userSelector';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import Debugger from '../debugger/debugger';
import { lightIconButtonStyle, space_L } from '../styling/style';
import DisplaySettings from './DisplaySettings';
import LocalAccount from './LocalAccount';
import UserProfile from './UserProfile';
import UserSessions from './UserSessions';

export default function Settings(): JSX.Element {
  const i18n = useTranslations();
  const accounts = useCurrentUserAccounts();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  if (currentUser && accounts != 'LOADING') {
    return (
      <div className={css({ padding: space_L })}>
        <Flex>
          <IconButton
            title="Back"
            icon={faArrowLeft}
            onClick={() => navigate('..')}
            className={lightIconButtonStyle}
          ></IconButton>
          <h2>{i18n.common.settings}</h2>
        </Flex>
        <Tabs routed defaultTab="user">
          <Tab name="user" label={i18n.user.user}>
            <Flex direction="row" className={css({ gap: space_L })}>
              <UserProfile user={currentUser} />
              {accounts.map(account => {
                if (account.id != null && +account.id >= 0) {
                  return (
                    <>
                      <LocalAccount key={account.id} accountId={account.id} />
                    </>
                  );
                }
              })}
            </Flex>
          </Tab>
          <Tab name="display" label={i18n.common.display}>
            <DisplaySettings />
          </Tab>
          <Tab name="activeSess" label={i18n.user.activeSessions}>
            <UserSessions user={currentUser} />
          </Tab>
          <Tab name="debugger" label={i18n.admin.debugger} invisible={!currentUser.admin}>
            <Debugger />
          </Tab>
        </Tabs>
      </div>
    );
  } else {
    return (
      <div className={css({ padding: space_L })}>
        <i>{i18n.authentication.error.mustBeAuthenticated}</i>
      </div>
    );
  }
}
