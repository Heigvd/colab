/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../../i18n/I18nContext';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { lightIconButtonStyle, space_2xl, space_xl } from '../../styling/style';
import IconButton from '../common/element/IconButton';
import { TipsCtx, WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import Debugger from '../debugger/debugger';
import SharedModelsList from '../projects/models/SharedModelsList';
import DisplaySettings from './DisplaySettings';
import { UserManagement } from './UserManagement';
import UserHttpSessions from './UserSessions';

export default function SettingsTabs(): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();

  const { currentUser } = useCurrentUser();

  const tipsConfig = React.useContext(TipsCtx);

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  if (currentUser) {
    return (
      <div className={css({ padding: space_2xl })}>
        {/** ICI POUR centrer: <div  className={css({alignSelf:'center'})}> */}
        <Flex align="center">
          <IconButton
            title={i18n.common.back}
            icon={'arrow_back'}
            onClick={() => navigate('..')}
            className={lightIconButtonStyle}
          />
          <h2>{i18n.user.label.settings}</h2>
        </Flex>

        <Tabs routed>
          <Tab name="profile" label={i18n.user.label.profile}>
            <UserManagement user={currentUser} />
          </Tab>
          <Tab name="display" label={i18n.common.display}>
            <DisplaySettings />
          </Tab>
          <Tab name="active-sessions" label={i18n.user.label.activeSessions}>
            <UserHttpSessions user={currentUser} />
          </Tab>
          <Tab name="shared-model" label="Shared models" invisible={!tipsConfig.WIP.value}>
            {/* <h2>my shared models</h2>
            <p>(imagine a view with the thumbnails)</p>
            <p>I can remove one. No more use</p>
            <p>ask the model owner if I can be editor of it</p> */}
            <WIPContainer>
              <SharedModelsList />
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
        <i>{i18n.common.error.sorryError}</i>
      </div>
    );
  }
}
