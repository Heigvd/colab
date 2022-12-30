/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';
import {
  BeforeDropParams,
  Connection,
  ConnectionEstablishedParams,
  EVENT_CONNECTION,
  INTERCEPT_BEFORE_DROP,
} from '@jsplumb/core';
import { ActivityFlowLink, Card, CardContent } from 'colab-rest-client';
import { uniq } from 'lodash';
import * as React from 'react';
import * as API from '../../../../API/api';
import useTranslations from '../../../../i18n/I18nContext';
import { getLogger } from '../../../../logger';
import { useProjectBeingEdited } from '../../../../selectors/projectSelector';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../../../store/hooks';
import InlineLoading from '../../../common/element/InlineLoading';
import Flex from '../../../common/layout/Flex';
import { borderRadius, space_L, space_M, space_S } from '../../../styling/style';
import { AFCard } from './ActivityFlowCardThumb';

const logger = getLogger('ActivityFlow');
logger.setLevel(4);

function getChildrenDeep(card: Card, cards: Card[], cardContents: CardContent[]): Card[] {
  const queue = [card];
  const children: Card[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const subCards = cardContents
      .filter(cc => cc.cardId == current.id) // card variants
      .flatMap(cc => cards.filter(subcard => subcard.parentId === cc.id)); // each variant subcards
    queue.push(...subCards);
    children.push(...subCards);
  }

  return children;
}

export interface AFPlumbRef {
  divs: Record<string, Element>;
  connections: Record<string, Connection>;
}

export default function ActivityFlowChart(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const { project, status } = useProjectBeingEdited();

  const plumbRefs = React.useRef<AFPlumbRef>({ divs: {}, connections: {} });

  const [rootNode, setRootNode] = React.useState<HTMLDivElement | null>(null);
  const [jsPlumb, setJsPlumb] = React.useState<BrowserJsPlumbInstance | undefined>(undefined);

  React.useEffect(() => {
    let jsPlumb: BrowserJsPlumbInstance | null = null;
    if (rootNode != null) {
      logger.debug('Init JsPlumb');
      const plumb = newInstance({
        container: rootNode,
        connector: { type: 'Straight', options: { stub: 15 } },
        paintStyle: { strokeWidth: 1, stroke: 'var(--primaryColor)' },
        anchor: { type: 'Perimeter', options: { shape: 'Rectangle' } },
        anchors: ['Right', 'Left'],
        endpoints: [
          { type: 'Dot', options: { radius: 3 } },
          { type: 'Dot', options: { radius: 3 } },
        ],
        connectionOverlays: [
          {
            type: 'Arrow',
            options: { location: 1, width: 10, length: 5 },
          },
        ],
      });

      plumb.addSourceSelector('.CardSource *, .CardSourceHandle *', {
        allowLoopback: false,
        parentSelector: '.CardSource',
        anchors: ['Right', 'Left'],
      });

      plumb.addTargetSelector('.CardTarget');

      plumb.bind(INTERCEPT_BEFORE_DROP, (params: BeforeDropParams) => {
        // create FlowLink !
        const prevCardId = (params.connection.source as HTMLElement).getAttribute('data-cardid');
        const nextCardId = (params.connection.target as HTMLElement).getAttribute('data-cardid');

        // check if it creates a loop
        //        logger.debug("Before DROP Connection: from ", prevCardId, " to ", nextCardId, params)
        //        logger.info("BEFORE DROP");
        //        return true;
        //      });

        //      plumb.bind(EVENT_CONNECTION_MOVED, (params: ConnectionMovedParams<HTMLDivElement>) => {
        // Move existing link
        //        const prevCardId = params.connection.source.getAttribute("data-cardid")
        //        const nextCardId = params.newEndpoint.element.getAttribute("data-cardid")
        const data = params.connection.getData();
        if (data) {
          const link = data['link'] as ActivityFlowLink;

          if (link) {
            // TODO: check if it creates a loop ???

            if (prevCardId === nextCardId) {
              dispatch(API.deleteActivityFlowLink(link.id!));
            } else {
              logger.debug(
                'BEFOREDROP Connection: from ',
                prevCardId,
                ' to ',
                nextCardId,
                link,
                params,
              );
              if (
                prevCardId != null &&
                +prevCardId !== link.previousCardId &&
                +prevCardId !== link.nextCardId
              ) {
                logger.debug('New source', prevCardId);

                dispatch(
                  API.changeActivityFlowLinkPreviousCard({
                    linkId: link.id!,
                    cardId: +prevCardId,
                  }),
                );
              } else if (nextCardId != null && +nextCardId !== link.nextCardId) {
                logger.debug('New target ', nextCardId);

                dispatch(
                  API.changeActivityFlowLinkNextCard({
                    linkId: link.id!,
                    cardId: +nextCardId,
                  }),
                );
              }
            }
            return false;
          }
        }
        return true;
      });

      plumb.bind(EVENT_CONNECTION, (params: ConnectionEstablishedParams<HTMLDivElement>) => {
        // create FlowLink !
        const prevCardId = params.source.getAttribute('data-cardid');
        const nextCardId = params.target.getAttribute('data-cardid');
        const link = params.connection.getData()['link'];

        if (link == null && prevCardId != null && nextCardId != null) {
          logger.debug('New link', prevCardId, ' to ', nextCardId, 'with data: ', link);
          dispatch(
            API.createActivityFlowLink({
              previousId: +prevCardId,
              nextId: +nextCardId,
            }),
          );
          plumbRefs.current.connections['tmp'] = params.connection;
          //params.connection.destroy();
        }
      });

      jsPlumb = plumb;
      setJsPlumb(plumb);
    }

    () => {
      //clean
      if (jsPlumb) {
        logger.debug('Clear JSPLUB');
        jsPlumb.destroy();
      }
    };
  }, [rootNode, dispatch]);

  const cardsStatus = useAppSelector(state => state.cards.status);
  const cards: Card[] = useAppSelector(
    state =>
      Object.values(state.cards.cards).flatMap(card =>
        card.card != null && card.card.parentId != null ? [card.card] : [],
      ),
    shallowEqual,
  );

  const contentsStatus = useAppSelector(state => state.cards.contentStatus);
  const cardContents: CardContent[] = useAppSelector(
    state =>
      Object.values(state.cards.contents).flatMap(contents =>
        contents.content != null ? [contents.content] : [],
      ),
    shallowEqual,
  );

  const linksStatus = useAppSelector(state => state.activityFlowLinks.status);
  const links = useAppSelector(state => Object.values(state.activityFlowLinks.links), shallowEqual);

  const projectId = project != null ? project.id : undefined;

  React.useEffect(() => {
    if (cardsStatus == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getAllProjectCards(projectId));
    }
  }, [cardsStatus, dispatch, projectId]);

  React.useEffect(() => {
    if (cardsStatus === 'READY' && contentsStatus == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getAllProjectCardContents(projectId));
    }
  }, [cardsStatus, contentsStatus, dispatch, projectId]);

  React.useEffect(() => {
    if (cardsStatus === 'READY' && linksStatus == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getAllActivityFlowLinks(projectId));
    }
  }, [cardsStatus, linksStatus, dispatch, projectId]);

  React.useEffect(() => {
    if (jsPlumb) {
      logger.debug('UseEffect: The Paint Effect');

      //      jsPlumb.connections.forEach(connection => {
      //        logger.debug("Connection", connection.source, connection.target);
      //        connection.destroy();
      //      });

      links.forEach(link => {
        const cId = `Connection-${link.id}`;
        const fromId = `Card-${link.previousCardId}`;
        const toId = `Card-${link.nextCardId}`;
        const source = plumbRefs.current.divs[fromId];
        const target = plumbRefs.current.divs[toId];

        // Clear connection which doesn't exist any longer

        logger.info(`Refresh link from #${link.id} ${fromId}->${toId}`, source, target);

        if (source != null && target != null) {
          const existingConnection = plumbRefs.current.connections[cId];
          if (existingConnection != null) {
            if (existingConnection.source != source) {
              jsPlumb.setSource(existingConnection, source);
            }
            if (existingConnection.target != target) {
              jsPlumb.setTarget(existingConnection, target);
            }
          } else {
            if (plumbRefs.current.connections[cId] == null) {
              const connection = jsPlumb.connect({
                source: source,
                target: target,
                data: { link },
                reattach: true,
                anchors: [
                  [1, 0.5, 0, 0, -30],
                  [0, 0.5, 0, 0, 30],
                ],
              });
              plumbRefs.current.connections[cId] = connection;
            }
          }
        } else {
          logger.info('Missing node');
        }
      });

      Object.entries(plumbRefs.current.connections).forEach(([key, connection]) => {
        if (connection) {
          logger.debug(
            'RefConnection',
            connection.source,
            connection.target,
            connection.endpoints[0]?.element,
            connection.endpoints[1]?.element,
          );
          const data = connection.getData();
          if (data) {
            const theLink = data['link'] as ActivityFlowLink;
            if (!links.find(link => link.id === theLink?.id)) {
              logger.debug('No link => delete connection and ref');
              jsPlumb.deleteConnection(connection);
              delete plumbRefs.current.connections[key];
            }
          } else {
            logger.debug('No data => delete connection and ref');
            jsPlumb.deleteConnection(connection);
            delete plumbRefs.current.connections[key];
          }
        } else {
          logger.debug('No Connection => delete ref');
          delete plumbRefs.current.connections[key];
        }
      });
      jsPlumb.repaintEverything();
    }
  }, [jsPlumb, rootNode, links]);

  const reflow = React.useCallback(() => {
    if (jsPlumb) {
      //      try {
      jsPlumb.repaintEverything();
      //      } catch (e) {
      //        logger.debug('Fail to repaint', e);
      //      }
    }
  }, [jsPlumb]);

  React.useEffect(() => {
    if (rootNode) {
      const r = reflow;
      const ro = new ResizeObserver(() => {
        r();
      });
      ro.observe(rootNode);
      () => {
        ro.disconnect();
      };
    }
  }, [reflow, rootNode]);

  if (status === 'READY' && project == null) {
    return <i>Error: no project selected</i>;
  } else if (cardsStatus === 'READY' && contentsStatus === 'READY' && linksStatus === 'READY') {
    // cards with direction acivity flow link connection
    const inFlow = cards.filter(card =>
      links.find(link => link.nextCardId === card.id || link.previousCardId === card.id),
    );

    // cards in the activity flow becaus of an ancestor
    const inFlowChildren = uniq(inFlow.flatMap(card => getChildrenDeep(card, cards, cardContents)));

    // cards not in the activity neither directy not transitively
    const notInFlow = cards.filter(
      card => !inFlow.includes(card) && !inFlowChildren.includes(card),
    );

    const cardsToProcess = [...inFlow];
    const cardGroups: Card[][] = [];
    const linksToProcess = [...links];
    while (linksToProcess.length > 0) {
      // extract all card with no predecessor (or already processed predecessor)
      const cardGroup = cardsToProcess.filter(
        card => linksToProcess.find(link => link.nextCardId === card.id) == null,
      );
      if (cardGroup.length > 0) {
        // stack the group
        cardGroups.push(cardGroup);
        // no need to process links from this group any longer
        removeAll(
          linksToProcess,
          linksToProcess.filter(link => cardGroup.find(card => card.id === link.previousCardId)),
        );
        // no need to process cards from this group any longer
        removeAll(cardsToProcess, cardGroup);
      } else {
        logger.debug('LinksToProcess: ', linksToProcess);
        logger.debug('CardsToProcess: ', cardsToProcess);
        // purge
        linksToProcess.length = 0;
      }
    }
    if (cardsToProcess.length > 0) {
      cardGroups.push(cardsToProcess);
    }

    return (
      <Flex align="stretch" direction="column" className={css({ padding: space_L })}>
        <Flex
          direction="column"
          theRef={ref => setRootNode(ref)}
          className={css({
            '& .jtk-endpoint': {
              zIndex: 2,
            },
            scale: '1',
            '& .jtk-drag-hover': {
              boxShadow: '0 0 1px 1px hotpink',
            },
          })}
        >
          {jsPlumb != null ? (
            <>
              <Flex
                className={css({
                  padding: space_M,
                  border: '2px solid var(--lightGray)',
                  borderRadius: borderRadius,
                  alignSelf: 'stretch',
                })}
                direction="column"
                align="stretch"
              >
                <h3 className={css({ margin: space_S + ' 0' })}>Not in flow</h3>
                <Flex direction="row" wrap="wrap">
                  {notInFlow.map(card => (
                    <AFCard
                      key={`Card-${card.id!}`}
                      card={card}
                      jsPlumb={jsPlumb}
                      plumbRefs={plumbRefs.current}
                    />
                  ))}
                </Flex>
              </Flex>
              <h3>{i18n.common.views.activityFlow}</h3>
              <Flex direction="row">
                {cardGroups.map((group, i) => (
                  <Flex
                    direction="column"
                    justify="space-evenly"
                    align="stretch"
                    className={css({ padding: '20px' })}
                    key={`group-${i}`}
                  >
                    {group.map(card => (
                      <AFCard
                        key={`Card-${card.id!}`}
                        card={card}
                        jsPlumb={jsPlumb}
                        plumbRefs={plumbRefs.current}
                      />
                    ))}
                  </Flex>
                ))}
              </Flex>
            </>
          ) : null}
        </Flex>
      </Flex>
    );
  } else {
    return <InlineLoading />;
  }
}

//function getVariantsOfCard(card: Card, variants: CardContent[], lang: string) {
//  return sortCardContents(
//    variants.filter(content => content.cardId === card.id),
//    lang);
//}

function removeAll<T>(list: T[], itemsToRemove: T[]) {
  itemsToRemove.forEach(item => {
    const i = list.indexOf(item);
    if (i >= 0) {
      list.splice(i, 1);
    }
  });
}
