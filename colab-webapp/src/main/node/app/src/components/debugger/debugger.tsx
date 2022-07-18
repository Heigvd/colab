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

export default function Debugger(): JSX.Element {
  return (
    <Tabs>
      <Tab name="input" label="input">
        <DebugInput />
      </Tab>
      <Tab name="form" label="form">
        <DebugForm />
      </Tab>
    </Tabs>
  );
}
