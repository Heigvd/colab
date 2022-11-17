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
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useCurrentUser, useCurrentUserAccounts } from '../../selectors/userSelector';
import { useAppSelector } from '../../store/hooks';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import Debugger from '../debugger/debugger';
import SharedModelsList from '../projects/SharedModelsList';
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
  const status = useAppSelector(state => state.projects.status);

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
            title={i18n.common.back}
            icon={faArrowLeft}
            onClick={() => navigate('..')}
            className={lightIconButtonStyle}
          ></IconButton>
          <h2>{i18n.user.settings}</h2>
        </Flex>
        <Tabs routed>
          <Tab name="user" label={i18n.user.profile}>
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
          <Tab name="sharedModels" label="Shared models">
            {/* <h2>my shared models</h2>
            <p>(imagine a view with the thumbnails)</p>
            <p>I can remove one. No more use</p>
            <p>ask the model owner if I can be editor of it</p> */}
            <SharedModelsList reload={API.getUserProjects} loadingStatus={status} />
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
