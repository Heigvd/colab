/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import GlobalCardTypeList from '../cards/cardtypes/GlobalCardTypeList';
import Tabs, { Tab } from '../common/Tabs';
import { AllProjects } from '../projects/ProjectList';
import { space_L } from '../styling/style';
import AllUsers from './AllUsers';
import LoggersConfig from './LoggersConfig';
import MainPanel from './MainPanel';
import Who from './Who';

export default function Admin(): JSX.Element {
  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  return (
    <div className={css({ padding: space_L })}>
      <h2>Admin Page</h2>
      <div>
        <Tabs>
          <Tab name="main" label="Admin">
            <MainPanel />
          </Tab>
          <Tab name="users" label="Users">
            <AllUsers />
          </Tab>
          <Tab name="projects" label="Projects">
            <AllProjects />
          </Tab>
          <Tab name="loggers" label="Loggers">
            <LoggersConfig />
          </Tab>
          <Tab name="onlineusers" label="Online Users">
            <Who />
          </Tab>
          <Tab name="types" label="Card Types">
            <GlobalCardTypeList />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
