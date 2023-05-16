/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { useDraggable } from '@dnd-kit/core';
import { css } from '@emotion/css';
import * as React from 'react';

// interface DraggableProps {
//   id: string;
//   element: React.ElementType;
//   children: React.ReactNode;
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Draggable(props: any) {
  const Element = props.element || 'div';
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props.id,
    data: props.data,
  });

  return (
    <Element
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={props.isDragging && css({ opacity: 0.5 })}
    >
      {props.children}
    </Element>
  );
}
