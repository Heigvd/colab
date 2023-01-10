/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';
//import {Connection, UIGroup} from '@jsplumb/core';
import '@jsplumb/connector-flowchart';
import { Card } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAllProjectCards } from '../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/element/InlineLoading';

const getCardKey = (c: Card) => `Card-${c.id}`;

const assignRef = (refs: Divs, element: Element | null, key: string) => {
  if (element != null) {
    refs[key] = element;
  } else {
    delete refs[key];
  }
};

interface PlumbedCardProps {
  card: Card;
  divs: Divs;
  jsPlumb: BrowserJsPlumbInstance;
}

function PlumbedCard({ card, jsPlumb, divs }: PlumbedCardProps) {
  const [thisNode, setThisNode] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (thisNode) {
      //jsPlumb.setDraggable(thisNode, true);
      jsPlumb.manage(thisNode);
    }
    return () => {
      if (thisNode != null) {
        //jsPlumb.setDraggable(thisNode, false);
      }
    };
  }, [jsPlumb, thisNode]);

  return (
    <div
      className={css({
        //        position:'absolute',
        minWidth: '30px',
        minHeight: '30px',
        backgroundColor: card.color || 'hotpink',
        '&.jtk-drag': {
          position: 'absolute',
        },
      })}
      ref={ref => {
        setThisNode(ref);
        assignRef(divs, ref, getCardKey(card));
      }}
    >
      {card.title || 'no name'}
    </div>
  );
}

type Divs = Record<string, Element>;

export default function PlayJsPlumb(): JSX.Element {
  const { project } = useProjectBeingEdited();
  const dispatch = useAppDispatch();

  const cards = useAllProjectCards();
  const cardStatus = useAppSelector(state => state.cards.status);
  const projectId = project != null ? project.id : undefined;

  React.useEffect(() => {
    if (cardStatus == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getAllProjectCards(projectId));
    }
  }, [cardStatus, dispatch, projectId]);

  const [thisNode, setThisNode] = React.useState<HTMLDivElement | null>(null);

  const divRefs = React.useRef<Divs>({});

  const [jsPlumb, setJsPlumb] = React.useState<BrowserJsPlumbInstance | undefined>(undefined);

  // Initialize and destroy JsPlumb instance
  React.useEffect(() => {
    let plumb: BrowserJsPlumbInstance | null = null;
    if (thisNode) {
      plumb = newInstance({
        container: thisNode,
        connector: { type: 'Flowchart', options: { stub: 10 } },
        paintStyle: { strokeWidth: 1, stroke: 'black' },
        anchors: ['Top', 'Bottom'],
        endpoint: 'Blank',
      });

      setJsPlumb(plumb);
    }

    () => {
      //clean
      if (plumb) {
        plumb.destroy();
      }
    };
  }, [thisNode]);

  const reflow = React.useCallback(() => {
    if (jsPlumb) {
      jsPlumb.repaintEverything();
    }
  }, [jsPlumb]);

  React.useEffect(() => {
    const r = reflow;
    window.addEventListener('resize', r);
    () => {
      window.removeEventListener('resize', r);
    };
  }, [reflow]);

  return (
    <div
      ref={ref => {
        setThisNode(ref);
        if (ref) {
          divRefs.current['root'] = ref;
        } else {
          delete divRefs.current['root'];
        }
      }}
      className={css({
        position: 'relative',
      })}
    >
      {cardStatus !== 'READY' || jsPlumb == null ? (
        <InlineLoading />
      ) : (
        cards.map(card => (
          <PlumbedCard
            key={getCardKey(card)}
            card={card}
            jsPlumb={jsPlumb}
            divs={divRefs.current}
          />
        ))
      )}
    </div>
  );
}
