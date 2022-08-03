/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { getLogger } from '../../../logger';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../../store/hooks';
import { ProgressBar } from '../../cards/CardLayout';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';

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

//function getPreviousCards(nextCard: Card, links: ActivityFlowLink[], cards: Card[]) {
//  links
//    .filter(link => link.nextCardId === nextCard.id) // links to the given nextCard
//    .map(link => cards.find(card => card.id === link.previousCardId));
//}

const cardStyle = (color: string | null | undefined): string =>
  css({
    display: 'flex',
    userSelect: 'none',
    flexDirection: 'column',
    margin: '20px',
    backgroundColor: color || undefined,
    //  flexWrap: 'wrap',
    borderRadius: '5px',
    minHeight: '100px',
    minWidth: '180px',
    justifyContent: 'space-between',
    zIndex: 1,
  });

const padding = css({
  padding: '5px',
});

interface CardProps {
  card: Card;
  allVariants: CardContent[];
  extraTools?: React.ReactNode;
  showProgressBar?: boolean;
  plumbRefs: PlumbRef;
  jsPlumb: BrowserJsPlumbInstance;
}

export function Card({
  card,
  allVariants,
  showProgressBar,
  jsPlumb,
  plumbRefs,
}: CardProps): JSX.Element {
  const color = card.color || 'white';
  const i18n = useTranslations();

  const refCb = React.useCallback(
    (ref: HTMLDivElement | null) => {
      assignDiv(jsPlumb, plumbRefs.divs, ref, `Card-${card.id}`);
    },
    [jsPlumb, plumbRefs, card.id],
  );

  const variants = getVariantsOfCard(card, allVariants);

  return (
    <div ref={refCb} data-cardid={card.id} className={`CardSource CardTarget ${cardStyle(color)}`}>
      <Flex justify="space-between">
        <div className={padding}>{card.title || i18n.modules.card.untitled}</div>
        <FontAwesomeIcon className="CardSourceHandle" icon={faProjectDiagram} />
      </Flex>
      <Flex className={css({ width: '100%' })}>
        {variants.map(variant => (
          <Flex
            key={variant.id}
            direction="column"
            justify="space-between"
            className={css({ width: '100%' })}
          >
            {variants.length > 1 ? (
              <div className={padding}>{variant.title || i18n.modules.content.untitled}</div>
            ) : null}
            {showProgressBar ? <ProgressBar variant={variant} /> : null}
          </Flex>
        ))}
      </Flex>
    </div>
  );
}

interface PlumbRef {
  divs: Record<string, Element>;
  connections: Record<string, Connection>;
}

export default function ActivityFlowChart(): JSX.Element {
  const dispatch = useAppDispatch();
  const { project, status } = useProjectBeingEdited();

  const plumbRefs = React.useRef<PlumbRef>({ divs: {}, connections: {} });

  const [rootNode, setRootNode] = React.useState<HTMLDivElement | null>(null);
  const [jsPlumb, setJsPlumb] = React.useState<BrowserJsPlumbInstance | undefined>(undefined);

  React.useEffect(() => {
    let jsPlumb: BrowserJsPlumbInstance | null = null;
    if (rootNode != null) {
      logger.debug('Init JsPlumb');
      const plumb = newInstance({
        container: rootNode,
        connector: { type: 'Straight', options: { gap: 5 } },
        paintStyle: { strokeWidth: 1, stroke: 'black' },
        anchor: { type: 'Perimeter', options: { shape: 'Rectangle' } },
        //        anchors: ['Right', 'Left'],
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

      plumb.addSourceSelector('.CardSource, .CardSourceHandle', {
        allowLoopback: false,
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
        logger.info('Before Drop');
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
    const r = reflow;
    window.addEventListener('resize', r);
    () => {
      window.removeEventListener('resize', r);
    };
  }, [reflow]);

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
      <Flex
        direction="column"
        theRef={ref => setRootNode(ref)}
        className={css({
          '& .jtk-endpoint': {
            zIndex: 2,
          },
          '& .jtk-drag-hover': {
            boxShadow: '0 0 1px 1px hotpink',
          },
        })}
      >
        {jsPlumb != null ? (
          <>
            <span>Activity Flow</span>
            <Flex direction="row">
              {cardGroups.map((group, i) => (
                <Flex
                  direction="column"
                  justify="space-evenly"
                  className={css({ padding: '20px' })}
                  key={`group-${i}`}
                >
                  {group.map(card => (
                    <Card
                      key={`Card-${card.id!}`}
                      card={card}
                      allVariants={cardContents}
                      jsPlumb={jsPlumb}
                      plumbRefs={plumbRefs.current}
                      showProgressBar
                    />
                  ))}
                </Flex>
              ))}
            </Flex>
            <span>Not in flow</span>
            <Flex direction="row">
              {notInFlow.map(card => (
                <Card
                  key={`Card-${card.id!}`}
                  card={card}
                  allVariants={cardContents}
                  jsPlumb={jsPlumb}
                  plumbRefs={plumbRefs.current}
                  showProgressBar
                />
              ))}
            </Flex>
          </>
        ) : null}
      </Flex>
    );
  } else {
    return <InlineLoading />;
  }
}

function getVariantsOfCard(card: Card, variants: CardContent[]) {
  return variants.filter(content => content.cardId === card.id);
}

const assignDiv = (
  jsPlumb: BrowserJsPlumbInstance,
  refs: PlumbRef['divs'],
  element: Element | null,
  key: string,
) => {
  logger.debug('Assign div ', key, ' to ', element);
  if (element != null) {
    jsPlumb.manage(element);
    jsPlumb.setDraggable(element, false);
    refs[key] = element;
  } else {
    delete refs[key];
  }
};

function removeAll<T>(list: T[], itemsToRemove: T[]) {
  itemsToRemove.forEach(item => {
    const i = list.indexOf(item);
    if (i >= 0) {
      list.splice(i, 1);
    }
  });
}
