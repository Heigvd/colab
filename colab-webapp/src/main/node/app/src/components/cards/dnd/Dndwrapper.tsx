/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { DroppableContainer, RectMap } from '@dnd-kit/core/dist/store';
import { ClientRect, Coordinates } from '@dnd-kit/core/dist/types';
import { css } from '@emotion/css';
import { Card } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import logger from '../../../logger';
import { useAppDispatch } from '../../../store/hooks';

const wrapperStyle = css({
  flexGrow: 1,
});

// const dragOverlayStyle = css({
//   display: 'flex',
//   flexGrow: 1,
//   height: '100%',
// });

interface collisionType {
  active: Active;
  collisionRect: ClientRect;
  droppableRects: RectMap;
  droppableContainers: DroppableContainer[];
  pointerCoordinates: Coordinates | null;
}

function collisionDetection(args: collisionType) {
  const pointerCollisions = pointerWithin(args);
  logger.info(typeof args);
  logger.info(args);

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return rectIntersection(args);
}

interface DndProps {
  cards: Card[] | null | undefined;
  children: React.ReactNode;
}

export default function Dndwrapper({ cards, children }: DndProps) {
  const dispatch = useAppDispatch();
  const [draggingCardId, setDraggingCardId] = React.useState<number | undefined>(undefined);
  const [draggingCard, setDraggingCard] = React.useState<Card | undefined>(undefined);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const sensors = useSensors(mouseSensor);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active) {
      if (cards) {
        setDraggingCardId(+active.id!);
        setDraggingCard(active.data.current as Card);
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.over && draggingCardId) {
      if (event.over.data.current!.cardId != draggingCardId) {
        dispatch(
          API.moveCard({
            cardId: +draggingCardId!,
            newParentId: +event.over.id!,
          }),
        );
      }
    }
    setDraggingCardId(undefined);
    setDraggingCard(undefined);
  }

  return (
    <div className={wrapperStyle}>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={collisionDetection}
        sensors={sensors}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {draggingCard ? (
            <span>{draggingCard.title}</span>
          ) : // <CardThumbWithSelector card={draggingCard!} className={dragOverlayStyle} />
          null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
