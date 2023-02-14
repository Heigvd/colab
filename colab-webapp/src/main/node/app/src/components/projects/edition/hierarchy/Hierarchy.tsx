/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { BrowserJsPlumbInstance, newInstance } from '@jsplumb/browser-ui';
import '@jsplumb/connector-flowchart';
import { Connection } from '@jsplumb/core';
import { Card, CardContent } from 'colab-rest-client';
import { throttle } from 'lodash';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../../../API/api';
import useTranslations from '../../../../i18n/I18nContext';
import { getLogger } from '../../../../logger';
import { useCurrentProjectId } from '../../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { CardContentDetail } from '../../../../store/slice/cardSlice';
import InlineLoading from '../../../common/element/InlineLoading';
import { BlockInput } from '../../../common/element/Input';
import Flex from '../../../common/layout/Flex';
import Icon from '../../../common/layout/Icon';
import { space_sm } from '../../../styling/style';
import HierarchyBranch from './HierarchyBranch';
import SubContainer from './HierarchySubContainer';

const logger = getLogger('JsPlumb');

const subsStyle = css({
  minWidth: '100%',
});

export interface PlumbRef {
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

export const HierarchyCTX = React.createContext<PlumbRef>({
  divs: {},
  connections: {},
  assignConnection: () => {},
  assignDiv: () => {},
  showCreatorButton: true,
  showOnlyCard: undefined,
  dnd: true,
});

interface AllSubsContainerProps {
  contents: (CardContentDetail | undefined)[];
  subs: { [contentId: number]: (Card | undefined)[] | null | undefined };
  jsPlumb: BrowserJsPlumbInstance;
}

export function AllSubsContainer({ contents, subs, jsPlumb }: AllSubsContainerProps) {
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
  onContentClick,
  forceZoom,
}: HierarchyDisplayProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
  const currentProjectId = useCurrentProjectId();

  React.useEffect(() => {
    if (cardStatus == 'NOT_INITIALIZED' && currentProjectId != null) {
      dispatch(API.getAllProjectCards(currentProjectId));
    }
  }, [cardStatus, dispatch, currentProjectId]);

  const contentStatus = useAppSelector(state => state.cards.contentStatus);

  React.useEffect(() => {
    if (cardStatus === 'READY' && contentStatus == 'NOT_INITIALIZED' && currentProjectId != null) {
      dispatch(API.getAllProjectCardContents(currentProjectId));
    }
  }, [cardStatus, contentStatus, dispatch, currentProjectId]);

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
  const navigateToEditPageCb = React.useCallback(
    (card: Card) => {
      const path = `edit/${card.id}/`;
      if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
        navigate(`../${path}`);
      } else {
        navigate(path);
      }
    },
    [navigate],
  );
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
            const el = findAncestorWithSelector(elGroup, 'HierarchyBranch');
            if (el && !hasClass(el, `HierarchyBranch-${rootId}`)) {
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
    <HierarchyCTX.Provider
      value={{
        divs: plumbState.divs,
        connections: plumbState.connections,
        assignDiv,
        assignConnection,
        showCreatorButton: enableDragAndDrop || showAdd,
        showOnlyCard,
        variantDecorator,
        cardDecorator,
        onCardClick: navigateToEditPageCb,
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
          <div
            className={css({
              width: '150px',
              padding: space_sm,
              margin: 'auto',
              backgroundColor: 'var(--bg-primary)',
            })}
          >
            {forceZoom == null && (
              <BlockInput
                type="range"
                label={ <Icon icon={'zoom_in'} title={i18n.common.zoom} />}
                value={zoomRef.current}
                placeholder="0"
                max="2"
                min="0.5"
                step="0.1"
                onChange={newValue => setZoom(Number(newValue))}
                saveMode="SILLY_FLOWING"
                labelClassName={css({ flexGrow: 1, textAlign: 'center' })}
              />
            )}
            {/* <FeaturePreview>
              <IconButton icon={faRefresh} onClick={throttleRepaint} title="" />
              <IconButton icon={faRefresh} onClick={cleanCb} title="" />
            </FeaturePreview> */}
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
              <HierarchyBranch rootId={rootId} jsPlumb={jsPlumb} />
            ) : (
              <InlineLoading />
            )}
          </div>
        </div>
      </div>
    </HierarchyCTX.Provider>
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
