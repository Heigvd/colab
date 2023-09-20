/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { BrowserJsPlumbInstance, Connection } from '@jsplumb/browser-ui';
import { CardContent } from 'colab-rest-client';
import React from 'react';
import logger from '../../../logger';
import { lightIconButtonStyle, space_lg } from '../../../styling/style';
import CardCreator from '../../cards/CardCreator';
import { HierarchyCTX, PlumbRef } from './Hierarchy';

export interface SubCardCreatorProps {
  parent: CardContent;
  jsPlumb: BrowserJsPlumbInstance;
}

export function manageConnection({
  jsPlumb,
  source,
  target,
  cRefs,
  assignConnection,
  key,
}: {
  jsPlumb: BrowserJsPlumbInstance;
  source: Element | undefined;
  target: Element | undefined;
  cRefs: PlumbRef['connections'];
  assignConnection: PlumbRef['assignConnection'];
  key: string;
}) {
  let connection: Connection | undefined = cRefs[key];

  if (source != null && target != null) {
    if (connection == null) {
      // no connection & both ends exists
      connection = jsPlumb.connect({
        source: source,
        target: target,
      });
      jsPlumb.setDraggable(source, false);
      assignConnection(connection, key);
      try {
        jsPlumb.repaintEverything();
      } catch {
        logger.debug('Fail to repaint');
      }
    } else {
      // connection already exists
      if (connection.source != source) {
        logger.debug('Move source');
        jsPlumb.setSource(connection, source);
      }
      if (connection.target != target) {
        logger.debug('Move source');
        jsPlumb.setTarget(connection, target);
      }
    }
  }
}

export default function SubCardCreator({ jsPlumb, parent }: SubCardCreatorProps) {
  const { divs, assignDiv, connections, assignConnection } = React.useContext(HierarchyCTX);

  const parentNode = divs[`CardContent-${parent.id}`];
  //  const thisNode = divRefs[`CreateSubCard-${parent.id}`];
  const [thisNode, setThisNode] = React.useState<HTMLDivElement | undefined>(undefined);

  React.useEffect(() => {
    logger.info('Redraw (+) connection', thisNode, parentNode);
    manageConnection({
      jsPlumb,
      source: thisNode,
      target: parentNode,
      cRefs: connections,
      assignConnection: assignConnection,
      key: `NewCardForContent-${parent.id}`,
    });
  }, [jsPlumb, connections, assignConnection, parentNode, thisNode, parent.id]);

  return (
    <div
      className={cx(
        'SubCardCreator',
        css({
          border: '1px grey dashed',
          alignSelf: 'flex-start',
          margin: '40px 20px 10px 20px',
          padding: space_lg,
          borderRadius: '5px',
        }),
      )}
      ref={ref => {
        assignDiv(ref, `CreateSubCard-${parent.id!}`);
        setThisNode(ref || undefined);
      }}
    >
      <CardCreator parentCardContent={parent} className={lightIconButtonStyle} />
    </div>
  );
}
