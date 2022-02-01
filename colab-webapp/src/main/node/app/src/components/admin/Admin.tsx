/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import GlobalCardTypeList from '../cards/cardtypes/GlobalCardTypeList';
import { SecondLevelLink } from '../common/Link';
import { AllProjects } from '../projects/ProjectList';
import AllUsers from './AllUsers';
import LoggersConfig from './LoggersConfig';
import MainPanel from './MainPanel';
import Who from './Who';

export default function Admin(): JSX.Element {
  return (
    <div>
      <h2>Admin Page</h2>
      <div>
        <nav>
          <SecondLevelLink to="">Admin</SecondLevelLink>
          <SecondLevelLink to="users">Users</SecondLevelLink>
          <SecondLevelLink to="projects">Projects</SecondLevelLink>
          <SecondLevelLink to="loggers">Loggers</SecondLevelLink>
          <SecondLevelLink to="onlineusers">Online Users</SecondLevelLink>
          <SecondLevelLink to="types">Card Types</SecondLevelLink>
        </nav>
        <div>
          <Routes>
            <Route path="" element={<MainPanel />} />
            <Route path="loggers" element={<LoggersConfig />} />
            <Route path="projects" element={<AllProjects />} />
            <Route path="users" element={<AllUsers />} />
            <Route path="onlineusers" element={<Who />} />
            <Route path="types" element={<GlobalCardTypeList />} />
            <Route element={<Navigate to="" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
