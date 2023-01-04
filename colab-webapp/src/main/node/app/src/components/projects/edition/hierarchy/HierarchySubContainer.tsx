/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { BrowserJsPlumbInstance } from '@jsplumb/browser-ui';
import { Card, CardContent } from 'colab-rest-client';
import React from 'react';
import InlineLoading from '../../../common/element/InlineLoading';
import { HierarchyCTX } from './Hierarchy';
import HierarchyBranch from './HierarchyBranch';
import SubCardCreator from './HierarchyCardCreator';

interface SubContainerProps {
  parent: CardContent;
  jsPlumb: BrowserJsPlumbInstance;
  subcards: (Card | undefined)[];
}

export default function SubContainer({ parent, subcards, jsPlumb }: SubContainerProps) {
  const { showCreatorButton, showOnlyCard } = React.useContext(HierarchyCTX);

  const filterdSubCards = showOnlyCard
    ? subcards.filter(card => card && showOnlyCard.includes(card.id!))
    : subcards;

  return (
    <div
      data-cardcontent={parent.id || ''}
      className={`SubContainer SubContainer-${parent.id} ${css({
        display: 'flex',
        flexWrap: 'wrap',
      })}`}
      key={`cc${parent.id!}`}
    >
      {filterdSubCards.map((sub, i) => {
        if (sub?.id != null) {
          return <HierarchyBranch key={`subcard-${sub.id}`} rootId={sub.id} jsPlumb={jsPlumb} />;
        } else {
          return <InlineLoading key={`subcard-i-${i}`} />;
        }
      })}
      {showCreatorButton && <SubCardCreator parent={parent} jsPlumb={jsPlumb} />}
    </div>
  );
}
