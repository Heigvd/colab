/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card } from 'colab-rest-client';
import * as React from 'react';
import { oneLineEllipsisStyle, p_md } from '../../styling/style';
import Flex from '../common/layout/Flex';
import CardLayout from './CardLayout';

const dragOverlayStyle = cx(
  p_md,
  css({
    height: '1.2em',
    width: '10em',
    //display: 'flex',
    //flexGrow: 1,
    //height: '100%',
  }),
);

interface CardDragOverlayProps {
  card: Card;
  containerClassName?: string;
}

export default function CardDragOverlay({
  card,
  containerClassName,
}: CardDragOverlayProps): JSX.Element {
  return (
    <CardLayout
      card={card}
      variant={undefined}
      variants={[]}
      coveringColor={true}
      showProgressBar={false}
      className={cx(dragOverlayStyle, containerClassName)}
    >
      <Flex grow={1} align="center">
        <span className={oneLineEllipsisStyle}>{card.title}</span>
      </Flex>
    </CardLayout>
  );
}
