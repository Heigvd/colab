/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { lightIconButtonStyle, space_xl } from '../../styling/style';
import GlobalCardTypeList from '../cardtypes/GlobalCardTypeList';
import { Link } from '../common/element/Link';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Tabs, { Tab } from '../common/layout/Tabs';
import { AllProjectsAndModels } from '../projects/ProjectList';
import AllUsers from './AllUsers';
import LiveMonitor from './LiveMonitor';
import LoggersConfig from './LoggersConfig';
import MainPanel from './MainPanel';
import Who from './Who';

export default function AdminTabs(): JSX.Element {
  const i18n = useTranslations();

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  return (
    <div className={css({ padding: space_xl })}>
      <Flex align="center">
        <Link to={'..'}>
          <Icon title={i18n.common.back} icon={'arrow_back'} className={lightIconButtonStyle} />
        </Link>
        <h2>Admin Page</h2>
      </Flex>
      <div>
        <Tabs routed>
          <Tab name="main" label="Admin">
            <MainPanel />
          </Tab>
          <Tab name="online-users" label="Online Users">
            <Who />
          </Tab>
          <Tab name="users" label="Users">
            <AllUsers />
          </Tab>
          <Tab name="projects" label="Projects">
            <AllProjectsAndModels />
          </Tab>
          <Tab name="card-types" label={i18n.modules.cardType.cardTypesLongWay}>
            <GlobalCardTypeList />
          </Tab>
          <Tab name="loggers" label="Loggers">
            <LoggersConfig />
          </Tab>
          <Tab name="live-monitor" label="Live Monitor">
            <LiveMonitor />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
