/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { BrowserJsPlumbInstance } from '@jsplumb/browser-ui';
import { Card, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { shallowEqual } from 'react-redux';
import * as API from '../../../../API/api';
import logger from '../../../../logger';
import { useProjectRootCard } from '../../../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../../../selectors/projectSelector';
import { customColabStateEquals, useAppDispatch, useAppSelector } from '../../../../store/hooks';
import InlineLoading from '../../../common/element/InlineLoading';
import { AllSubsContainer, HierarchyCTX } from './Hierarchy';
import { manageConnection } from './HierarchyCardCreator';
import CardGroup from './HierarchyCardThumb';

interface HierarchyRootViewProps {
  rootId: number;
  jsPlumb: BrowserJsPlumbInstance;
}

export default function HierarchyRootView({
  rootId,
  jsPlumb,
}: HierarchyRootViewProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { project, status } = useProjectBeingEdited();

  const rootCard = useProjectRootCard(project);

  const projectRootCardId = entityIs(rootCard, 'Card') ? rootCard.id : undefined;

  const root = useAppSelector(state => {
    const rootState = state.cards.cards[rootId];
    if (rootState) {
      return rootState;
    }
    return undefined;
  }); //refEqual is fine

  React.useEffect(() => {
    if (root != null && root.card && root.card.id && root.contents === undefined) {
      dispatch(API.getCardContents(root.card.id));
    }
  }, [root, dispatch]);
  /**
   * Select card contents.
   * @return list of contents if they are known, undefined if they're unknown, null if loading is pending
   */
  const contents = useAppSelector(state => {
    if (root != null && root.card != null && root.card.id != null) {
      const card = state.cards.cards[root.card.id];
      if (card != null) {
        if (card.contents != null) {
          return Object.values(card.contents).map(contentId => {
            return state.cards.contents[contentId];
          });
        } else {
          return card.contents;
        }
      }
    }
  }, shallowEqual);

  const subs = useAppSelector(state => {
    const result: { [contentId: number]: (Card | undefined)[] | null | undefined } = {};

    if (contents != null) {
      contents.forEach(content => {
        if (content?.content != null) {
          const cId = content.content.id;
          if (cId != null) {
            if (content.subs != null) {
              result[cId] = content.subs.map(cardId => {
                const sCard = state.cards.cards[cardId];
                if (sCard != null && sCard.card != null) {
                  return sCard.card;
                } else {
                  return undefined;
                }
              });
            } else {
              result[cId] = content.subs;
            }
          }
        }
      });
    }
    return result;
  }, customColabStateEquals);

  React.useEffect(() => {
    if (contents != null) {
      contents.forEach(cardContent => {
        if (cardContent?.content?.id != null) {
          const subcards = subs[cardContent.content.id];
          if (subcards === undefined) {
            dispatch(API.getSubCards(cardContent.content.id));
          }
        }
      });
    }
  }, [contents, subs, dispatch]);

  const { divs, connections, assignDiv, assignConnection } = React.useContext(HierarchyCTX);

  const parentNode = divs[`CardContent-${root?.card?.parentId}`];
  const [thisNode, setThisNode] = React.useState<HTMLDivElement | undefined>(undefined);

  React.useEffect(() => {
    const connectionId = `Card-${rootId}`;
    logger.info('Redraw Card connection', thisNode, parentNode);
    manageConnection({
      jsPlumb,
      source: thisNode,
      target: parentNode,
      cRefs: connections,
      assignConnection: assignConnection,
      key: connectionId,
    });
  }, [jsPlumb, parentNode, thisNode, connections, assignConnection, rootId]);

  if (contents == null) {
    return <InlineLoading />;
  } else if (project == null) {
    return (
      <div>
        <i>Error: no project selected</i>
      </div>
    );
  } else if (status != 'READY' || root == null || root.card == null) {
    return <InlineLoading />;
  } else {
    return (
      <div
        data-card={rootId || ''}
        className={`HierarchyBranch HierarchyBranch-${root.card.id} ${css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '40px 10px',
        })}`}
        ref={ref => {
          assignDiv(ref, `HierarchyBranch-${rootId}`);
          setThisNode(ref || undefined);
        }}
      >
        {projectRootCardId !== rootId ? <CardGroup card={root.card} /> : null}
        <AllSubsContainer contents={contents} subs={subs} jsPlumb={jsPlumb} />
      </div>
    );
  }
}
