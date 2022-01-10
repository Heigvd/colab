/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
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
import Flex from '../../common/Flex';
import InlineLoading from '../../common/InlineLoading';
import { cardShadow } from '../../styling/style';

const logger = getLogger('JsPlumb');
//logger.setLevel(4);

const cardStyle = (color: string | null | undefined): string =>
  css({
    display: 'flex',
    flexDirection: 'column',
    padding: '0px',
    margin: '0px',
    backgroundColor: color || undefined,
    //  flexWrap: 'wrap',
    borderRadius: '5px',
    ':hover': {
      '& > div >  .variant-creator': {
        visibility: 'visible',
      },
    },
  });

//
//const addStyle = css({
//  borderStyle: 'dashed',
//  borderColor: 'lightgrey',
//  color: 'lightgrey',
//})

const subsStyle = css({
  flexWrap: 'wrap',
  minWidth: '100%',
  //  borderStyle: 'dashed',
  //  borderColor: 'lightgrey',
  //  color: 'lightgrey',
});

interface PlumbRef {
  divs: Record<string, Element>;
  connections: Record<string, Connection>;
}

const assignDiv = (refs: PlumbRef['divs'], element: Element | null, key: string) => {
  logger.debug('Assign div ', key, ' to ', element);
  if (element != null) {
    refs[key] = element;
  } else {
    delete refs[key];
  }
};

const assignConnection = (
  refs: PlumbRef['connections'],
  connection: Connection | null,
  key: string,
) => {
  logger.debug('Assign connection ', key, ' to ', connection);
  if (connection != null) {
    refs[key] = connection;
  } else {
    delete refs[key];
  }
};

interface CardContentThumbProps {
  id: string;
  name: string;
  className?: string;
  onClick?: () => void;
  divRefs: PlumbRef['divs'];
}

function CardContentThumb({
  id,
  name,
  className,
  onClick,
  divRefs,
}: CardContentThumbProps): JSX.Element {
  return (
    <div
      ref={r => {
        assignDiv(divRefs, r, `CardContent-${id}`);
      }}
      className={cx(
        css({
          //width: 'max-content',
          boxShadow: cardShadow,
          cursor: onClick != null ? 'pointer' : 'default',
          padding: '10px',
        }),
        className,
      )}
      onClick={onClick}
    >
      {name || <i>untitled</i>}
    </div>
  );
}

interface CardGroupProps {
  card: Card;
  divRefs: PlumbRef['divs'];
}

function CardGroup({ card, divRefs }: CardGroupProps) {
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

  return (
    <div className={`CardGroup ${cardStyle(card.color)}`} key={`CardGroupc${card.id!}`}>
      <div>{card.title || <i>no title</i>}</div>
      {contents != null ? (
        <Flex
          direction="row"
          theRef={ref => {
            assignDiv(divRefs, ref, `CardGroup-${card.id}`);
          }}
        >
          {contents.map((v, i) =>
            v?.content != null ? (
              <CardContentThumb
                divRefs={divRefs}
                id={String(v.content.id)}
                key={v.content.id}
                name={v.content.title || ''}
              />
            ) : (
              <InlineLoading key={`loader-${i}`} />
            ),
          )}

          <CardContentThumb
            divRefs={divRefs}
            id={`new-for-${card.id}`}
            name="(+)"
            className={`variant-creator ${css({
              visibility: 'hidden',
              //              position: 'absolute',
              //              left: '100%',
            })}`}
            onClick={() => {
              dispatch(API.createCardContentVariantWithBlockDoc(card.id!));
            }}
          />
        </Flex>
      ) : (
        <InlineLoading />
      )}
    </div>
  );
}

export interface SubCardCreatorProps {
  parent: CardContent;
  divRefs: PlumbRef['divs'];
  cRefs: PlumbRef['connections'];
  jsPlumb: BrowserJsPlumbInstance;
}

function manageConnection({
  jsPlumb,
  source,
  target,
  cRefs,
  key,
}: {
  jsPlumb: BrowserJsPlumbInstance;
  source: Element | undefined;
  target: Element | undefined;
  cRefs: PlumbRef['connections'];
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
      assignConnection(cRefs, connection, key);
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

function SubCardCreator({ divRefs, cRefs, jsPlumb, parent }: SubCardCreatorProps) {
  const parentNode = divRefs[`CardContent-${parent.id}`];
  //  const thisNode = divRefs[`CreateSubCard-${parent.id}`];
  const [thisNode, setThisNode] = React.useState<HTMLDivElement | undefined>(undefined);

  React.useEffect(() => {
    logger.debug('Redraw connection', thisNode, parentNode);
    manageConnection({
      jsPlumb,
      source: thisNode,
      target: parentNode,
      cRefs: cRefs,
      key: `NewCardForContent-${parent.id}`,
    });
  }, [jsPlumb, cRefs, parentNode, thisNode, parent.id]);

  return (
    <div
      className={cx(
        cardStyle(undefined),
        css({
          border: '1px grey dashed',
          alignSelf: 'flex-start',
          margin: '30px',
          padding: '20px',
        }),
      )}
      ref={ref => {
        assignDiv(divRefs, ref, `CreateSubCard-${parent.id!}`);
        setThisNode(ref || undefined);
      }}
    >
      <CardCreator parent={parent} />
    </div>
  );
}

interface AllSubsContainerProps {
  contents: (CardContentDetail | undefined)[];
  subs: { [contentId: number]: (Card | undefined)[] | null | undefined };
  divRefs: PlumbRef['divs'];
  cRefs: PlumbRef['connections'];
  jsPlumb: BrowserJsPlumbInstance;
}

function AllSubsContainer({ contents, subs, divRefs, cRefs, jsPlumb }: AllSubsContainerProps) {
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
                divRefs={divRefs}
                cRefs={cRefs}
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
  divRefs: PlumbRef['divs'];
  cRefs: PlumbRef['connections'];
  jsPlumb: BrowserJsPlumbInstance;
  subcards: (Card | undefined)[];
}

function SubContainer({ parent, subcards, divRefs, cRefs, jsPlumb }: SubContainerProps) {
  return (
    <div
      data-cardcontent={parent.id || ''}
      className={`SubContainer SubContainer-${parent.id} ${css({
        display: 'flex',
      })}`}
      key={`cc${parent.id!}`}
    >
      {subcards.map((sub, i) => {
        if (sub?.id != null) {
          return (
            <CardHierarchy
              key={`subcard-${sub.id}`}
              rootId={sub.id}
              divRefs={divRefs}
              cRefs={cRefs}
              jsPlumb={jsPlumb}
            />
          );
        } else {
          return <InlineLoading key={`subcard-${i}`} />;
        }
      })}
      <SubCardCreator parent={parent} divRefs={divRefs} cRefs={cRefs} jsPlumb={jsPlumb} />
    </div>
  );
}

interface CardHierarchyProps {
  rootId: number;
  divRefs: PlumbRef['divs'];
  cRefs: PlumbRef['connections'];
  jsPlumb: BrowserJsPlumbInstance;
}

/**
 *
 */
export function CardHierarchy({
  rootId,
  divRefs,
  cRefs,
  jsPlumb,
}: CardHierarchyProps): JSX.Element {
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

  const parentNode = divRefs[`CardContent-${root?.card?.parentId}`];
  const thisNode = divRefs[`CardHierarchy-${rootId}`];

  React.useEffect(() => {
    const connectionId = `Card-${rootId}`;
    manageConnection({
      jsPlumb,
      source: thisNode,
      target: parentNode,
      cRefs: cRefs,
      key: connectionId,
    });
  }, [jsPlumb, parentNode, thisNode, cRefs, rootId]);

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
          assignDiv(divRefs, ref, `CardHierarchy-${rootId}`);
        }}
      >
        {projectRootCardId !== rootId ? <CardGroup card={root.card} divRefs={divRefs} /> : null}
        <AllSubsContainer
          contents={contents}
          subs={subs}
          divRefs={divRefs}
          cRefs={cRefs}
          jsPlumb={jsPlumb}
        />
      </div>
    );
  }
}

interface HierarchyDisplayProps {
  rootId: number;
}

export default function Hierarchy({ rootId }: HierarchyDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();

  const plumbRefs = React.useRef<PlumbRef>({ divs: {}, connections: {} });

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
    const r = reflow;
    window.addEventListener('resize', r);
    () => {
      window.removeEventListener('resize', r);
    };
  }, [reflow]);

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
    dragged?: HTMLElement;
    hoverGroup?: HTMLElement;
    connection?: Connection;
    tmpConnection?: Connection;
    delta: [number, number];
    status: 'idle' | 'dragging';
  }>({ status: 'idle', delta: [0, 0] });

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
        if (dndRef.current.status === 'dragging') {
          if (dndRef.current.hoverGroup && dndRef.current.dragged) {
            const newParentId = dndRef.current.hoverGroup.getAttribute('data-cardcontent');
            const cardId = dndRef.current.dragged.getAttribute('data-card');
            if (newParentId && cardId) {
              logger.debug('Move Card ', cardId, ' to ', newParentId);
              dispatch(
                API.moveCard({
                  cardId: +cardId!,
                  newParentId: +newParentId!,
                }),
              ).then(() => {
                if (jsPlumb) {
                  //jsPlumb.reset();
                  //                Object.values(plumbRefs.current.connections).forEach(c => c.destroy());
                  //                plumbRefs.current.connections = {};
                  //                toggleIt(current => !current);
                }
              });
            }
          }
        }
        if (dndRef.current.dragged) {
          dndRef.current.dragged.style.left = '';
          dndRef.current.dragged.style.top = '';
          dndRef.current.dragged.style.position = '';
          dndRef.current.dragged.style.pointerEvents = '';

          throttleRepaint();
        }

        if (dndRef.current.hoverGroup) {
          dndRef.current.hoverGroup.classList.remove('dnd-target-group');
        }

        if (dndRef.current.connection) {
          dndRef.current.connection.setVisible(true);
          throttleRepaint();
        }

        if (dndRef.current.tmpConnection) {
          if (jsPlumb) {
            logger.debug('Destroy TMP connection');
            jsPlumb.deleteConnection(dndRef.current.tmpConnection);
            dndRef.current.tmpConnection = undefined;
          }
        }

        dndRef.current.status = 'idle';
      } else if (e.type === 'mousedown') {
        if (dndRef.current.status === 'idle' && e.buttons === 1) {
          const elGroup = findAncestorWithSelector(e.target, 'CardGroup');
          if (elGroup) {
            const el = findAncestorWithSelector(elGroup, 'CardHierarchy');
            if (el && !hasClass(el, `CardHierarchy-${rootId}`)) {
              const pos = coord(e);
              dndRef.current.status = 'dragging';
              dndRef.current.hoverGroup = undefined;
              dndRef.current.dragged = el;
              dndRef.current.dragged.style.left = el.getBoundingClientRect().left + 'px';
              dndRef.current.dragged.style.top = el.getBoundingClientRect().right + 'px';
              dndRef.current.delta = [
                pos[0] - el.getBoundingClientRect().left,
                pos[1] - el.getBoundingClientRect().top,
              ];

              dndRef.current.dragged.style.position = `fixed`;

              const cardId = dndRef.current.dragged.getAttribute('data-card');
              dndRef.current.connection = plumbRefs.current.connections[`Card-${cardId}`];
              if (dndRef.current.connection) {
                dndRef.current.connection.setVisible(false);
              }

              throttleRepaint();
            }
          }
        }
      } else if (e.type === 'mousemove') {
        if (dndRef.current.status === 'dragging' && e.buttons === 1 && dndRef.current.dragged) {
          const pos = coord(e);
          const delta = dndRef.current.delta;
          dndRef.current.dragged.style.left = `${pos[0] - delta[0]}px`;
          dndRef.current.dragged.style.top = `${pos[1] - delta[1]}px`;
          dndRef.current.dragged.style.position = `fixed`;
          dndRef.current.dragged.style.pointerEvents = `none`;

          const subsContainer = findAncestorWithSelector(e.target, 'SubContainer');

          if (dndRef.current.hoverGroup) {
            dndRef.current.hoverGroup.classList.remove('dnd-target-group');
          }

          if (subsContainer != null) {
            const newParentId = subsContainer.getAttribute('data-cardcontent');
            const newParentTarget = plumbRefs.current.divs[`CardContent-${newParentId}`];

            if (dndRef.current.hoverGroup !== subsContainer && jsPlumb) {
              if (newParentTarget != null) {
                if (dndRef.current.tmpConnection == null) {
                  logger.debug('Create tmp connection');
                  dndRef.current.tmpConnection = jsPlumb.connect({
                    source: dndRef.current.dragged,
                    target: newParentTarget,
                  });
                } else {
                  logger.debug('Move TMP connection');
                  if (dndRef.current.tmpConnection.target !== newParentTarget) {
                    jsPlumb.setTarget(dndRef.current.tmpConnection, newParentTarget);
                  }
                }
              }
            }
            dndRef.current.hoverGroup = subsContainer;
            subsContainer.classList.add('dnd-target-group');
          }

          throttleRepaint();
        } else {
          dndRef.current.status = 'idle';
        }
      }
    },
    [rootId, dispatch, throttleRepaint, jsPlumb],
  );

  return (
    <div
      className={`${css({
        padding: '50px',
        '& .jtk-drag': {
          position: 'absolute',
        },
        '& .dnd-target-group': {
          boxShadow: '0px 0px 4px 1px #000000',
        },
      })}`}
      ref={ref => {
        setThisNode(ref);
        assignDiv(plumbRefs.current.divs, ref, 'root');
      }}
      onMouseUp={mouseHandler}
      onMouseDownCapture={mouseHandler}
      onMouseMove={mouseHandler}
      onMouseLeave={mouseHandler}
    >
      {jsPlumb != null && cardStatus === 'READY' && contentStatus == 'READY' ? (
        <CardHierarchy
          rootId={rootId}
          jsPlumb={jsPlumb}
          divRefs={plumbRefs.current.divs}
          cRefs={plumbRefs.current.connections}
        />
      ) : (
        <InlineLoading />
      )}
    </div>
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

function coord(e: React.MouseEvent): [number, number] {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left; //x position within the element.
  const y = e.clientY - rect.top;
  return [x, y];
}
