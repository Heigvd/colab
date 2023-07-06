/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppSelector } from '../../store/hooks';
import { selectStatusForInstanceableModels } from '../../store/selectors/projectSelector';
import { useCurrentUser, useCurrentUserAccounts } from '../../store/selectors/userSelector';
import { lightIconButtonStyle, space_2xl, space_xl } from '../../styling/style';
import IconButton from '../common/element/IconButton';
import { TipsCtx, WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import Debugger from '../debugger/debugger';
import SharedModelsList from '../projects/models/SharedModelsList';
import DisplaySettings from './DisplaySettings';
import LocalAccount from './LocalAccount';
import UserProfile from './UserProfile';
import UserHttpSessions from './UserSessions';

export default function Settings(): JSX.Element {
  const i18n = useTranslations();
  const accounts = useCurrentUserAccounts();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const status = useAppSelector(selectStatusForInstanceableModels);

  const tipsConfig = React.useContext(TipsCtx);

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  if (currentUser && accounts != 'LOADING') {
    return (
      <div className={css({ padding: space_2xl })}>
        {/** ICI POUR centrer: <div  className={css({alignSelf:'center'})}> */}
        <Flex align="center">
          <IconButton
            title={i18n.common.back}
            icon={'arrow_back'}
            onClick={() => navigate('..')}
            className={lightIconButtonStyle}
          ></IconButton>
          <h2>{i18n.user.settings}</h2>
        </Flex>

        <Tabs routed>
          <Tab name="user" label={i18n.user.profile}>
            <Flex direction="row" align-self="center" className={css({ gap: space_xl })}>
              <UserProfile user={currentUser} />
              {accounts.map(account => {
                if (account.id != null && +account.id >= 0) {
                  return (
                    <div key={account.id}>
                      <LocalAccount key={account.id} accountId={account.id} />
                    </div>
                  );
                }
              })}
            </Flex>
          </Tab>
          <Tab name="display" label={i18n.common.display}>
            <DisplaySettings />
          </Tab>
          <Tab name="activeSessions" label={i18n.user.activeSessions}>
            <UserHttpSessions user={currentUser} />
          </Tab>
          <Tab name="sharedModels" label="Shared models" invisible={!tipsConfig.WIP.value}>
            {/* <h2>my shared models</h2>
            <p>(imagine a view with the thumbnails)</p>
            <p>I can remove one. No more use</p>
            <p>ask the model owner if I can be editor of it</p> */}
            <WIPContainer>
              <SharedModelsList reload={API.getInstanceableModels} loadingStatus={status} />
            </WIPContainer>
          </Tab>
          <Tab name="debugger" label={i18n.admin.debugger} invisible={!currentUser.admin}>
            <Debugger />
          </Tab>
        </Tabs>
      </div>
    );
  } else {
    return (
      <div className={css({ padding: space_xl })}>
        <i>{i18n.authentication.error.mustBeAuthenticated}</i>
      </div>
    );
  }
}
