/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { useDraggable } from '@dnd-kit/core';
import { css, cx } from '@emotion/css';
import { Card } from 'colab-rest-client';
import * as React from 'react';

const draggableStyle = css({
  display: 'flex',
  flexGrow: 1,
});

export interface DndProps {
  id: string;
  data: Card | undefined;
  children: React.ReactNode;
  className?: string;
}

export default function Draggable({ id, data, children, className }: DndProps) {
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const { active, attributes, listeners, setNodeRef } = useDraggable({
    id: id,
    data: data,
  });

  React.useEffect(() => {
    if (active && active.id == id) {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  }, [active, isDragging, id]);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cx(className, draggableStyle, isDragging && css({ opacity: 0.5 }))}
    >
      {children}
    </div>
  );
}
