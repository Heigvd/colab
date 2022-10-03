/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';
import '@jsplumb/connector-flowchart';
import { Connection } from '@jsplumb/core';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import { throttle } from 'lodash';
import * as React from 'react';
import * as API from '../../../API/api';
import { getLogger } from '../../../logger';
import { useProjectRootCard } from '../../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { CardContentDetail } from '../../../store/card';
import {
  customColabStateEquals,
  shallowEqual,
  useAppDispatch,
  useAppSelector,
} from '../../../store/hooks';
import CardCreator from '../../cards/CardCreator';
import CardLayout from '../../cards/CardLayout';
import IconButton from '../../common/element/IconButton';
import InlineLoading from '../../common/element/InlineLoading';
import { BlockInput } from '../../common/element/Input';
import { FeaturePreview } from '../../common/element/Tips';
import Flex from '../../common/layout/Flex';
import { cardShadow, space_M, space_S } from '../../styling/style';

const logger = getLogger('JsPlumb');
//logger.setLevel(3);

const showAddVariantStyle = css({
  ':hover': {
    '& .variant-creator': {
      visibility: 'visible',
    },
  },
});

const grabGroupStyle = css({
  cursor: 'grab',
});

const clickGroupStyle = css({
  cursor: 'pointer',
});

//
//const addStyle = css({
//  borderStyle: 'dashed',
//  borderColor: 'lightgrey',
//  color: 'lightgrey',
//})

const subsStyle = css({
  // flexWrap: 'wrap',
  minWidth: '100%',
  //  borderStyle: 'dashed',
  //  borderColor: 'lightgrey',
  //  color: 'lightgrey',
});

interface PlumbRef {
  divs: Record<string, Element>;
  connections: Record<string, Connection>;
  assignDiv: (element: Element | null, key: string) => void;
  assignConnection: (connection: Connection | null, key: string) => void;
  showCreatorButton: boolean;
  showOnlyCard: number[] | undefined;
  variantDecorator?: (card: Card, cardContent: CardContent) => React.ReactNode;
  cardDecorator?: (card: Card) => React.ReactNode;
  onCardClick?: (card: Card) => void;
  onContentClick?: (card: Card, cardContent: CardContent) => void;
  dnd: boolean;
}

const HierarchyContext = React.createContext<PlumbRef>({
  divs: {},
  connections: {},
  assignConnection: () => {},
  assignDiv: () => {},
  showCreatorButton: true,
  showOnlyCard: undefined,
  dnd: true,
});

interface CardContentThumbProps {
  id: string;
  name: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  card?: Card;
  cardContent?: CardContent;
}

function CardContentThumb({
  id,
  name,
  className,
  onClick,
  onMouseDown,
  card,
  cardContent,
}: CardContentThumbProps): JSX.Element {
  const { assignDiv, variantDecorator } = React.useContext(HierarchyContext);
  return (
    <div
      ref={r => {
        assignDiv(r, `CardContent-${id}`);
      }}
      className={cx(
        css({
          //width: 'max-content',
          boxShadow: cardShadow,
          cursor: onClick != null ? 'pointer' : 'default',
          padding: '10px',
          flexGrow: 1,
        }),
        className,
        id ? `CardContent-${id}` : undefined,
      )}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {variantDecorator && card && cardContent ? variantDecorator(card, cardContent) : name}
    </div>
  );
}

interface CardGroupProps {
  card: Card;
}

function CardGroup({ card }: CardGroupProps) {
  const dispatch = useAppDispatch();

  const root = useAppSelector(state => {
    const rootState = state.cards.cards[card.id!];
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

  const { assignDiv, showCreatorButton, cardDecorator, onCardClick, onContentClick, dnd } =
    React.useContext(HierarchyContext);

  // <div className={`CardGroup ${cardStyle(card.color)}`} key={`CardGroupc${card.id!}`}>
  return (
    <div
      className={cx({
        CardGroup: true,
        [`CardType-${card.cardTypeId}`]: card.cardTypeId != null,
        [showAddVariantStyle]: showCreatorButton,
        [grabGroupStyle]: dnd,
        [clickGroupStyle]: onCardClick != null,
      })}
      key={`CardGroupc${card.id!}`}
    >
      <CardLayout card={card} variant={undefined} variants={[]}>
        <div
          onClick={
            onCardClick
              ? () => {
                  onCardClick(card);
                }
              : undefined
          }
          className={css({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            borderBottom:
              card.color && card.color != '#ffffff'
                ? '3px solid ' + card.color
                : '1px solid var(--lightGray)',
            width: '100%',
          })}
        >
          <div
            className={css({
              padding: space_S + ' ' + space_S + ' ' + space_S + ' ' + space_M,
            })}
          >
            {cardDecorator ? (
              cardDecorator(card)
            ) : (
              <span className={css({ fontWeight: 'bold' })}>{card.title || <i>no title</i>}</span>
            )}
          </div>
        </div>
        {contents != null ? (
          <Flex
            className={
              contents.length === 1
                ? css({
                    //visibility: 'hidden',
                  })
                : undefined
            }
            direction="row"
            align="stretch"
            theRef={ref => {
              assignDiv(ref, `CardGroup-${card.id}`);
            }}
          >
            {contents.map((v, i) =>
              v?.content != null ? (
                <CardContentThumb
                  id={String(v.content.id)}
                  key={v.content.id}
                  name={v.content.title || ''}
                  card={card}
                  cardContent={v.content}
                  onClick={
                    onContentClick
                      ? e => {
                          onContentClick(card, v.content!);
                          e.stopPropagation();
                        }
                      : undefined
                  }
                />
              ) : (
                <InlineLoading key={`loader-${i}`} />
              ),
            )}

            {showCreatorButton && (
              <CardContentThumb
                id={`new-for-${card.id}`}
                name="(+)"
                className={`variant-creator ${css({
                  visibility: 'hidden',
                  //              position: 'absolute',
                  //              left: '100%',
                })}`}
                onMouseDown={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={e => {
                  e.stopPropagation();
                  dispatch(API.createCardContentVariantWithBlockDoc(card.id!));
                }}
              />
            )}
          </Flex>
        ) : (
          <InlineLoading />
        )}
      </CardLayout>
    </div>
  );
}

export interface SubCardCreatorProps {
  parent: CardContent;
  jsPlumb: BrowserJsPlumbInstance;
}

function manageConnection({
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

function SubCardCreator({ jsPlumb, parent }: SubCardCreatorProps) {
  const { divs, assignDiv, connections, assignConnection } = React.useContext(HierarchyContext);

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
          margin: '30px',
          padding: '20px',
          borderRadius: '5px',
        }),
      )}
      ref={ref => {
        assignDiv(ref, `CreateSubCard-${parent.id!}`);
        setThisNode(ref || undefined);
      }}
    >
      <CardCreator parentCardContent={parent} />
    </div>
  );
}

interface AllSubsContainerProps {
  contents: (CardContentDetail | undefined)[];
  subs: { [contentId: number]: (Card | undefined)[] | null | undefined };
  jsPlumb: BrowserJsPlumbInstance;
}

function AllSubsContainer({ contents, subs, jsPlumb }: AllSubsContainerProps) {
  return (
    <Flex className={subsStyle} justify="space-evenly">
      {contents.map((v, i) => {
        if (v?.content != null) {
          const subcards = subs[v.content.id!];
          if (subcards != null) {
            return (
              <SubContainer
                key={`sub-${v.content.id}`}
                parent={v.content}
                jsPlumb={jsPlumb}
                subcards={subcards}
              />
            );
          }
        } else {
          return <InlineLoading key={`loader-${i}`} />;
        }
      })}
    </Flex>
  );
}

interface SubContainerProps {
  parent: CardContent;
  jsPlumb: BrowserJsPlumbInstance;
  subcards: (Card | undefined)[];
}

function SubContainer({ parent, subcards, jsPlumb }: SubContainerProps) {
  const { showCreatorButton, showOnlyCard } = React.useContext(HierarchyContext);

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
          return <CardHierarchy key={`subcard-${sub.id}`} rootId={sub.id} jsPlumb={jsPlumb} />;
        } else {
          return <InlineLoading key={`subcard-i-${i}`} />;
        }
      })}
      {showCreatorButton && <SubCardCreator parent={parent} jsPlumb={jsPlumb} />}
    </div>
  );
}

interface CardHierarchyProps {
  rootId: number;
  jsPlumb: BrowserJsPlumbInstance;
}

/**
 *
 */
export function CardHierarchy({ rootId, jsPlumb }: CardHierarchyProps): JSX.Element {
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

  const { divs, connections, assignDiv, assignConnection } = React.useContext(HierarchyContext);

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
        className={`CardHierarchy CardHierarchy-${root.card.id} ${css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '30px',
        })}`}
        ref={ref => {
          assignDiv(ref, `CardHierarchy-${rootId}`);
          setThisNode(ref || undefined);
        }}
      >
        {projectRootCardId !== rootId ? <CardGroup card={root.card} /> : null}
        <AllSubsContainer contents={contents} subs={subs} jsPlumb={jsPlumb} />
      </div>
    );
  }
}

interface HierarchyDisplayProps {
  rootId: number;
  enableDragAndDrop?: boolean;
  showAdd?: boolean;
  showOnlyCard?: number[];
  showTools?: boolean;
  variantDecorator?: (card: Card, cardContent: CardContent) => React.ReactNode;
  cardDecorator?: (card: Card) => React.ReactNode;
  onCardClick?: (card: Card) => void;
  onContentClick?: (card: Card, cardContent: CardContent) => void;
  forceZoom?: number;
}

export default function Hierarchy({
  rootId,
  enableDragAndDrop = true,
  showAdd = false,
  showOnlyCard,
  showTools = true,
  variantDecorator,
  cardDecorator,
  onCardClick,
  onContentClick,
  forceZoom,
}: HierarchyDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [plumbState, setPlumbState] = React.useState<Pick<PlumbRef, 'divs' | 'connections'>>({
    divs: {},
    connections: {},
  });

  const assignDiv = React.useCallback((div: Element | null, key: string) => {
    setPlumbState(state => {
      if (div != null) {
        state.divs[key] = div;
      } else {
        delete state.divs[key];
      }
      return state;
    });
  }, []);

  const assignConnection = React.useCallback((connection: Connection | null, key: string) => {
    setPlumbState(state => {
      logger.debug('Assign connection ', key, ' to ', connection);
      if (connection != null) {
        state.connections[key] = connection;
      } else {
        delete state.connections[key];
      }
      return state;
    });
  }, []);

  const [thisNode, setThisNode] = React.useState<HTMLDivElement | null>(null);
  const [jsPlumb, setJsPlumb] = React.useState<BrowserJsPlumbInstance | undefined>(undefined);

  React.useEffect(() => {
    let jsPlumb: BrowserJsPlumbInstance | null = null;
    if (thisNode != null) {
      const plumb = newInstance({
        container: thisNode,
        connector: { type: 'Flowchart', options: { stub: 5 } },
        paintStyle: { strokeWidth: 1, stroke: 'black' },
        anchors: ['Top', 'Bottom'],
        endpoint: 'Blank',
      });
      //      plumb.bind(EVENT_GROUP_MEMBER_ADDED, ({group, el, sourceGroup}: {group: UIGroup, el: Element, pos: unknown, sourceGroup?: UIGroup}) => {logger.debug("Add ", el, " to ", group.id, " from group ", sourceGroup?.id)})
      //      plumb.bind(EVENT_NESTED_GROUP_ADDED, ({parent, child}: {parent: UIGroup, child: UIGroup}) => {
      //        logger.debug("Add Nested Member ", child.id, " to group ", parent.id);
      //        const [, parentId] = parent.id.split("-");
      //        const [, cardId] = child.id.split("-");
      //        dispatch(API.moveCard({
      //          cardId: +cardId!,
      //          newParentId: + parentId!
      //        }))
      //      })

      //      plumb.bind(EVENT_GROUP_ADDED, ({group}: {group: UIGroup}) => {logger.debug("Create Group", group.id)})
      //      plumb.bind(EVENT_GROUP_REMOVED, ({group}: {group: UIGroup}) => {logger.debug("-------> REMOVE Group", group.id)})

      jsPlumb = plumb;
      setJsPlumb(plumb);
    }

    () => {
      //clean
      if (jsPlumb) {
        jsPlumb.destroy();
      }
    };
  }, [thisNode, dispatch]);

  const reflow = React.useCallback(() => {
    if (jsPlumb) {
      try {
        jsPlumb.repaintEverything();
      } catch {
        logger.debug('Fail to repaint');
      }
    }
  }, [jsPlumb]);

  React.useEffect(() => {
    if (thisNode) {
      const r = reflow;
      const ro = new ResizeObserver(() => {
        r();
      });
      ro.observe(thisNode);
      () => {
        ro.disconnect();
      };
    }
  }, [reflow, thisNode]);

  // make sure to have all cards
  //const cards = useAllProjectCards();
  const cardStatus = useAppSelector(state => state.cards.status);
  const { project } = useProjectBeingEdited();
  const projectId = project != null ? project.id : undefined;

  React.useEffect(() => {
    if (cardStatus == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getAllProjectCards(projectId));
    }
  }, [cardStatus, dispatch, projectId]);

  const contentStatus = useAppSelector(state => state.cards.contentStatus);

  React.useEffect(() => {
    if (cardStatus === 'READY' && contentStatus == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getAllProjectCardContents(projectId));
    }
  }, [cardStatus, contentStatus, dispatch, projectId]);

  //  const [, toggleIt] = React.useState(true);

  const dndRef = React.useRef<{
    draggedInPlace?: HTMLElement;
    dragged?: HTMLElement;
    hoverGroup?: Element;
    connection?: Connection;
    //tmpConnection?: Connection;
    delta: [number, number];
    status: 'idle' | 'dragging';
  }>({ status: 'idle', delta: [0, 0] });

  const [zoom, setZoom] = React.useState(1);
  const zoomRef = React.useRef(zoom);
  zoomRef.current = forceZoom ?? zoom;

  if (jsPlumb) {
    jsPlumb.setZoom(zoomRef.current);
  }

  const cleanCb = React.useCallback(() => {
    if (jsPlumb) {
      Object.entries(plumbState.connections).forEach(([key, value]) => {
        if (
          (value.source instanceof Element && value.source.isConnected === false) ||
          (value.target instanceof Element && value.target.isConnected === false)
        ) {
          jsPlumb.deleteConnection(value);
          delete plumbState.connections[key];
        }
      });
      jsPlumb.repaintEverything();
    }
  }, [jsPlumb, plumbState]);

  React.useEffect(() => {
    cleanCb();
  }, [cleanCb, showOnlyCard]);

  const throttleRepaint = React.useMemo(() => {
    if (jsPlumb) {
      return throttle(
        () => {
          try {
            jsPlumb.repaintEverything();
          } catch {
            logger.debug('Fail to repaint');
          }
        },
        40 /** 25x/s */,
        { leading: true, trailing: true },
      );
    } else {
      return () => {};
    }
  }, [jsPlumb]);

  const mouseHandler = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.type === 'mouseup') {
        (jsPlumb?.getContainer() as Element).classList.remove('draggin');
        if (dndRef.current.status === 'dragging') {
          if (dndRef.current.hoverGroup && dndRef.current.dragged) {
            const newParentId = dndRef.current.hoverGroup.getAttribute('data-cardcontent');
            const cardId = dndRef.current.dragged.getAttribute('data-card');
            if (newParentId && cardId) {
              //              if (jsPlumb && dndRef.current.connection) {
              //                jsPlumb.deleteConnection(dndRef.current.connection);
              //              }
              logger.debug('Move Card ', cardId, ' to ', newParentId);
              dispatch(
                API.moveCard({
                  cardId: +cardId!,
                  newParentId: +newParentId!,
                }),
              ).then(() => {
                if (jsPlumb) {
                  throttleRepaint();
                  //jsPlumb.reset();
                  //                Object.values(plumbRefs.current.connections).forEach(c => c.destroy());
                  //                plumbRefs.current.connections = {};
                  //                toggleIt(current => !current);
                }
              });
            }
          }
        }

        dndRef.current.draggedInPlace?.classList.remove('being-dragged');

        if (dndRef.current.dragged) {
          dndRef.current.dragged.style.left = '';
          dndRef.current.dragged.style.top = '';
          dndRef.current.dragged.style.position = '';
          dndRef.current.dragged.style.pointerEvents = '';

          dndRef.current.dragged.remove();
          throttleRepaint();
        }

        if (dndRef.current.hoverGroup) {
          dndRef.current.hoverGroup.classList.remove('dnd-target-group');
        }

        if (dndRef.current.connection) {
          //dndRef.current.connection.setVisible(true);
          throttleRepaint();
        }

        //        if (dndRef.current.tmpConnection) {
        //          if (jsPlumb) {
        //            logger.debug('Destroy TMP connection');
        //            jsPlumb.deleteConnection(dndRef.current.tmpConnection);
        //            dndRef.current.tmpConnection = undefined;
        //            throttleRepaint();
        //          }
        //        }

        dndRef.current.status = 'idle';
      } else if (e.type === 'mousedown') {
        if (dndRef.current.status === 'idle' && e.buttons === 1) {
          const elGroup = findAncestorWithSelector(e.target, 'CardGroup');
          if (elGroup) {
            const el = findAncestorWithSelector(elGroup, 'CardHierarchy');
            if (el && !hasClass(el, `CardHierarchy-${rootId}`)) {
              const container = jsPlumb!.getContainer() as Element;
              container.classList.add('draggin');
              const bbox = container.getBoundingClientRect();
              const elBbox = el.getBoundingClientRect();

              //const pos = coord(e);
              dndRef.current.status = 'dragging';
              dndRef.current.hoverGroup = undefined;

              const clone = el.cloneNode(true) as HTMLElement;
              thisNode!.append(clone);
              el.classList.add('being-dragged');

              dndRef.current.draggedInPlace = el;

              clone.classList.add('clone-dragged');
              clone.setAttribute('data-jtk-managed', '');

              const left = elBbox.left - bbox.left;
              const top = elBbox.top - bbox.top;

              dndRef.current.delta = [e.clientX - left, e.clientY - top];

              dndRef.current.dragged = clone;
              dndRef.current.dragged.style.left =
                (e.clientX - dndRef.current.delta[0]) / zoomRef.current + 'px';
              dndRef.current.dragged.style.top =
                (e.clientY - dndRef.current.delta[1]) / zoomRef.current + 'px';

              dndRef.current.dragged.style.position = `fixed`;

              const cardId = dndRef.current.dragged.getAttribute('data-card');
              dndRef.current.connection = plumbState.connections[`Card-${cardId}`];
              if (dndRef.current.connection) {
                dndRef.current.connection.setPaintStyle({ dashstyle: '5 5' });
                // dndRef.current.connection.setVisible(false);
              }

              throttleRepaint();
            }
          }
        }
      } else if (e.type === 'mousemove') {
        if (dndRef.current.status === 'dragging' && e.buttons === 1 && dndRef.current.dragged) {
          //const pos = coord(e);
          const delta = dndRef.current.delta;
          dndRef.current.dragged.style.left = `${(e.clientX - delta[0]) / zoomRef.current}px`;
          dndRef.current.dragged.style.top = `${(e.clientY - delta[1]) / zoomRef.current}px`;
          dndRef.current.dragged.style.position = `fixed`;
          dndRef.current.dragged.style.pointerEvents = `none`;

          //const cardGroup = findAncestorWithSelector(e.target, 'CardGroup');
          //if (cardGroup) {
          //logger.warn("CardGroup", cardGroup);
          //const subsContainer = cardGroup.parentElement?.querySelector(".SubContainer");
          if (dndRef.current.hoverGroup) {
            dndRef.current.hoverGroup.classList.remove('dnd-target-group');
          }

          const plusButton = findAncestorWithSelector(e.target, 'SubCardCreator');
          if (plusButton) {
            const subsContainer = findAncestorWithSelector(e.target, 'SubContainer');

            if (subsContainer != null) {
              //              const child = Array.from(subsContainer.children).find(child => child.contains(e.target as Node));
              //              if (child != null) {
              //                subsContainer.insertBefore(dndRef.current.dragged, child);
              //              } else {
              //                subsContainer.append(dndRef.current.dragged);
              //              }
              //              dndRef.current.dragged.style.position = ``;

              //              const newParentId = subsContainer.getAttribute('data-cardcontent');
              //              const newParentTarget = plumbState.divs[`CardContent-${newParentId}`];

              //              if (dndRef.current.hoverGroup !== subsContainer && jsPlumb) {
              //                if (newParentTarget != null) {
              //                  if (dndRef.current.tmpConnection == null) {
              //                    logger.debug('Create tmp connection');
              //                    dndRef.current.tmpConnection = jsPlumb.connect({
              //                      source: dndRef.current.dragged,
              //                      target: newParentTarget,
              //                    });
              //                  } else {
              //                    logger.debug('Move TMP connection');
              //                    if (dndRef.current.tmpConnection.target !== newParentTarget) {
              //                      jsPlumb.setTarget(dndRef.current.tmpConnection, newParentTarget);
              //                    }
              //                  }
              //                } else {
              //                  if (dndRef.current.tmpConnection) {
              //                    jsPlumb.deleteConnection(dndRef.current.tmpConnection);
              //                    dndRef.current.tmpConnection = undefined;
              //                  }
              //                }
              //              }
              dndRef.current.hoverGroup = subsContainer;
              subsContainer.classList.add('dnd-target-group');
            }
          } else {
            dndRef.current.hoverGroup = undefined;
            //            if (dndRef.current.tmpConnection) {
            //              jsPlumb?.deleteConnection(dndRef.current.tmpConnection);
            //              dndRef.current.tmpConnection = undefined;
            //            }
          }

          throttleRepaint();
        } else {
          dndRef.current.status = 'idle';
        }
      }
    },
    [rootId, dispatch, throttleRepaint, jsPlumb, thisNode, plumbState.connections],
  );

  React.useEffect(() => {
    logger.info('MainEffect');
  });

  return (
    <HierarchyContext.Provider
      value={{
        divs: plumbState.divs,
        connections: plumbState.connections,
        assignDiv,
        assignConnection,
        showCreatorButton: enableDragAndDrop || showAdd,
        showOnlyCard,
        variantDecorator,
        cardDecorator,
        onCardClick,
        onContentClick,
        dnd: enableDragAndDrop,
      }}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          userSelect: 'none',
        })}
      >
        {showTools && (
          <div className={css({ width: '200px' })}>
            {forceZoom ==null && <BlockInput
              type="range"
              label="zoom"
              value={zoomRef.current}
              placeholder="0"
              max="2"
              min="0.5"
              step="0.1"
              onChange={newValue => setZoom(Number(newValue))}
              saveMode="SILLY_FLOWING"
            />
            }
            <FeaturePreview>
              <IconButton icon={faRefresh} onClick={throttleRepaint} title="" />
              <IconButton icon={faRefresh} onClick={cleanCb} title="" />
            </FeaturePreview>
          </div>
        )}
        <div
          className={css({
            width: '100%',
            overflow: 'auto',
            position: 'relative',
            flexGrow: '1',
          })}
        >
          <div
            className={`${css({
              '& .jtk-drag': {
                position: 'absolute',
              },
              '&.draggin .SubCardCreator': {
                boxShadow: '0px 0px 4px 1px pink',
              },
              '& .dnd-target-group > .SubCardCreator': {
                boxShadow: '0px 0px 4px 1px hotpink',
              },
              transformOrigin: 'top left',
              scale: `${zoomRef.current}`,
              display: 'flex',
              '.SubContainer .SubContainer': {
                flexWrap: 'nowrap',
              },
              '.being-dragged': {
                opacity: 0.5,
              },
              '.clone-dragged': {
                color: 'hotpink',
              },
            })}`}
            ref={ref => {
              setThisNode(ref);
              assignDiv(ref, 'root');
            }}
            onMouseUp={enableDragAndDrop ? mouseHandler : undefined}
            onMouseDownCapture={enableDragAndDrop ? mouseHandler : undefined}
            onMouseMove={enableDragAndDrop ? mouseHandler : undefined}
            onMouseLeave={enableDragAndDrop ? mouseHandler : undefined}
          >
            {jsPlumb != null && cardStatus === 'READY' && contentStatus == 'READY' ? (
              <CardHierarchy rootId={rootId} jsPlumb={jsPlumb} />
            ) : (
              <InlineLoading />
            )}
          </div>
        </div>
      </div>
    </HierarchyContext.Provider>
  );
}

function hasClass(element: HTMLElement, klass: string) {
  return element.classList.contains(klass);
}

function findAncestorWithSelector(target: EventTarget, klass: string) {
  let current: HTMLElement | null = target as HTMLElement;
  while (current) {
    if (hasClass(current, klass)) {
      return current;
    } else {
      current = current.parentElement;
    }
  }
  return null;
}
