/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import logger from '../../logger';
import { useAppDispatch } from '../../store/hooks';
import { useAndLoadSubCards } from '../../store/selectors/cardSelector';
import { space_sm } from '../../styling/style';
import InlineLoading from '../common/element/InlineLoading';
import Droppable from '../common/layout/Droppable';
import Flex from '../common/layout/Flex';
import { PresenceContext } from '../presence/PresenceContext';
import ProjectBreadcrumbs from '../projects/ProjectBreadcrumbs';
import CardCreatorAndOrganize from './CardCreatorAndOrganize';
import CardThumbWithSelector from './CardThumbWithSelector';
import SubCardsGrid from './SubCardsGrid';

export const depthMax = 2;

export default function RootView({ rootContent }: { rootContent: CardContent | null | undefined }) {
  const dispatch = useAppDispatch();

  const { touch } = React.useContext(PresenceContext);

  const subCards = useAndLoadSubCards(rootContent?.id);

  const [organize, setOrganize] = React.useState(false);

  const [isDragging, setIsDragging] = React.useState(false);
  const [draggingCardId, setDraggingCardId] = React.useState<number | undefined>(undefined);
  const [draggingCard, setDraggingCard] = React.useState<Card | undefined>(undefined);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active) {
      setIsDragging(true);
      if (subCards) {
        setDraggingCardId(+active.id!);
        setDraggingCard(active.data.current as Card);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.over && draggingCardId) {
      if (event.over.data.current!.cardId != draggingCardId) {
        logger.info('draggingCard: ', draggingCardId);
        dispatch(
          API.moveCard({
            cardId: +draggingCardId!,
            newParentId: +event.over.id!,
          }),
        );
      }
    }
    setIsDragging(false);
    setDraggingCardId(undefined);
    setDraggingCard(undefined);
  }

  React.useEffect(() => {
    touch({});
  }, [touch]);

  return (
    <div
      className={css({
        display: 'flex',
        flexGrow: '1',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      })}
    >
      <ProjectBreadcrumbs />
      {rootContent != null ? (
        <Flex className={css({ overflow: 'hidden' })} justify="center" direction="row">
          {subCards && subCards.length > 0 && (
            <CardCreatorAndOrganize
              rootContent={rootContent}
              organize={{ organize: organize, setOrganize: setOrganize }}
              cardCreatorClassName={css({ marginLeft: space_sm })}
              organizeButtonClassName={css({ margin: space_sm + ' 0 0 ' + space_sm })}
            />
          )}
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Droppable id={String(rootContent.id!)} isDragging={isDragging} data={rootContent}>
              <SubCardsGrid
                cardContent={rootContent}
                depth={depthMax}
                showEmptiness={true}
                organize={organize}
                minCardWidth={150}
                className={css({ height: '100%', overflow: 'auto', flexGrow: 1 })}
                isDragging={isDragging}
                draggingCardId={draggingCardId}
              />
            </Droppable>

            <DragOverlay>
              {draggingCard ? <CardThumbWithSelector card={draggingCard!} /> : null}
            </DragOverlay>
          </DndContext>
        </Flex>
      ) : (
        <InlineLoading />
      )}
    </div>
  );
}
