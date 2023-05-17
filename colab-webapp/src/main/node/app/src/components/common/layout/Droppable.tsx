/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import { css } from '@emotion/css';
import * as React from 'react';
import logger from '../../../logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Droppable(props: any) {
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  useDndMonitor({
    onDragOver(event) {
      const { active, over } = event;
      logger.info(props);
      if (over && over.id == props.id && active.id && active.id != props.data.cardId) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    },
    onDragEnd() {
      setIsHovered(false);
    },
  });

  const Element = props.element || 'div';
  const { setNodeRef } = useDroppable({
    id: props.id,
    data: props.data,
  });

  return (
    <Element ref={setNodeRef} className={isHovered && css({ border: '1px solid orange' })}>
      {props.children}
    </Element>
  );
}
