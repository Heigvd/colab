/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { useDroppable } from '@dnd-kit/core';
import { css } from '@emotion/css';
import * as React from 'react';

export default function Droppable(props: any) {
  const Element = props.element || 'div';
  const { setNodeRef } = useDroppable({
    id: props.id,
  });

  return (
    <Element ref={setNodeRef} className={props.isDragging && css({ border: '4px solid orange' })}>
      {props.children}
    </Element>
  );
}
