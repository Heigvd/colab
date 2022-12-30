/*
 * The coLAB project
 * Copyright (C) 2022-2023 maxence, AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { monkeyWebsocket } from '../../../ws/websocket';
import { monkeyLiveEdition } from '../../live/LiveTextEditor';
import Monkey from './monkey.svg';

const monkeyStyle = `chaos-monkey ${css({
  height: '36px',
})}`;

/**
 * Display some monkeys.
 * Such monkies indicate chaos monkey army is enable
 */
export default function Monkies(): JSX.Element {
  return (
    <div>
      {monkeyWebsocket && (
        <span title="Websocket Monkey closes websocket connection every 30s">
          <Monkey className={monkeyStyle} />
        </span>
      )}
      {monkeyLiveEdition && (
        <span title="LiveEdition Monkey posts inconsistent changes">
          <Monkey className={monkeyStyle} />
        </span>
      )}
    </div>
  );
}
