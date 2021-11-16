/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Change } from 'colab-rest-client';
import * as React from 'react';
import Tips from '../common/Tips';
import { ChangeTreeRaw } from '../live/ChangeTree';
import PlayJsPlumb from './PlayJsPlumb';

export function DebugChangeTree(): JSX.Element {
  const revision = 'ws-468379789217693697::12';

  const changes: Change[] = [
    {
      '@class': 'Change',
      atClass: 'TextDataBlock',
      atId: 1,
      basedOn: ['ws-468379789217693697::12'],
      id: 1,
      liveSession: 'ws-468379789217693697',
      microchanges: [{ o: 21, t: 'I', v: ' ' }],
      revision: 'ws-468379789217693697::13',
    },
    {
      '@class': 'Change',
      atClass: 'TextDataBlock',
      atId: 1,
      basedOn: ['ws-468379789217693697::13'],
      id: 1,
      liveSession: 'ws-468379789217759233',
      microchanges: [{ o: 42, t: 'I', v: ' ' }],
      revision: 'ws-468379789217759233::7',
    },
    {
      '@class': 'Change',
      atClass: 'TextDataBlock',
      atId: 1,
      basedOn: ['ws-468379789217693697::13'],
      id: 1,
      liveSession: 'ws-468379789217693697',
      microchanges: [{ o: 22, t: 'I', v: 'quatre cinq sizt' }],
      revision: 'ws-468379789217693697::14',
    },
    {
      '@class': 'Change',
      atClass: 'TextDataBlock',
      atId: 1,
      basedOn: ['ws-468379789217693697::14'],
      id: 1,
      liveSession: 'ws-468379789217693697',
      microchanges: [{ o: 24, t: 'I', v: 'trqu' }],
      revision: 'ws-468379789217693697::15',
    },
    {
      '@class': 'Change',
      atClass: 'TextDataBlock',
      atId: 1,
      basedOn: ['ws-468379789217693697::14'],
      id: 1,
      liveSession: 'ws-468379789217759233',
      microchanges: [{ o: 59, t: 'I', v: 'mercredi jeudi' }],
      revision: 'ws-468379789217759233::8',
    },
    {
      '@class': 'Change',
      atClass: 'TextDataBlock',
      atId: 1,
      basedOn: [
        'ws-468379789217693697::15',
        'ws-468379789217759233::8',
        'ws-468379789217759233::7',
      ],
      id: 1,
      liveSession: 'ws-468379789217693697',
      microchanges: [{ o: 26, t: 'I', v: 'e' }],
      revision: 'ws-468379789217693697::16',
    },
    {
      '@class': 'Change',
      atClass: 'TextDataBlock',
      atId: 1,
      basedOn: [
        'ws-468379789217693697::15',
        'ws-468379789217693697::16',
        'ws-468379789217759233::7',
      ],
      id: 1,
      liveSession: 'ws-468379789217693697',
      microchanges: [{ o: 27, t: 'I', v: ' ' }],
      revision: 'ws-468379789217693697::17',
    },
  ];

  return (
    <div>
      <ChangeTreeRaw value="Ligne1: deux trois quatre" changes={changes} revision={revision} />
      <PlayJsPlumb />
    </div>
  );
}

export default function Debugger(): JSX.Element {
  return (
    <div>
      <PlayJsPlumb />
      <div>
        <Tips tipsType="TODO" interactionType="HOVER">
          coucou todo
        </Tips>
        <Tips tipsType="NEWS" interactionType="HOVER">
          coucou news
        </Tips>
        <Tips tipsType="TIPS" interactionType="HOVER">
          coucou tips
        </Tips>
      </div>
      <div>
        <Tips tipsType="TODO" interactionType="CLICK">
          coucou todo
        </Tips>
        <Tips tipsType="NEWS" interactionType="CLICK">
          coucou news
        </Tips>
        <Tips tipsType="TIPS" interactionType="CLICK">
          coucou tips
        </Tips>
      </div>
    </div>
  );
}
