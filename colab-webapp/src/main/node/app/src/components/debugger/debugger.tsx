/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Tabs, { Tab } from '../common/layout/Tabs';
import DebugForm from './debugForm';
import DebugInput from './DebugInput';
import { PlayGridOrganizer } from './GridOrganizer';
import IconAsImage from './IconAsImage';

export default function Debugger(): JSX.Element {
  return (
    <Tabs defaultTab="grid">
      <Tab name="input" label="input">
        <DebugInput />
      </Tab>
      <Tab name="form" label="form">
        <DebugForm />
      </Tab>
      <Tab name="grid" label="Grid">
        <PlayGridOrganizer />
      </Tab>
      <Tab name="icons" label="Icons">
        <IconAsImage />
      </Tab>
    </Tabs>
  );
}
