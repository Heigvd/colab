/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { css, cx } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { br } from '../../../styling/theme';

const droppableStyle = css({
  display: 'flex',
  flexGrow: 1,
  border: '1px solid transparent',
  borderRadius: br.md,
});

const droppingStyle = css({
  border: '1px solid orange',
})

interface DroppableProps {
  id: number;
  data: CardContent | undefined;
  children: React.ReactNode;
}

export default function Droppable({ id, data, children }: DroppableProps) {
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  useDndMonitor({
    onDragOver(event) {
      const { active, over } = event;
      if (over && data && over.id == id && active.id && active.id != data.cardId) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    },
    onDragEnd() {
      setIsHovered(false);
    },
  });

  const { setNodeRef } = useDroppable({
    id: id,
    data: data,
  });

  return (
    <div
      ref={setNodeRef}
      className={cx(droppableStyle, isHovered && droppingStyle)}
    >
      {children}
    </div>
  );
}
