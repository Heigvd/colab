/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { css } from '@emotion/css';
import { CardDef } from 'colab-rest-client';
import { cardShadow } from '../../styling/style';

interface DisplayProps {
  cardDef: CardDef;
}

const style = css({
  width: 'max-content',
  border: '1px solid grey',
  margin: '10px',
  padding: '10px',
  background: 'white',
  boxShadow: cardShadow,
});

export default function CardDefDisplay({ cardDef }: DisplayProps) {
  return (
    <div className={style}>
      <div>Title: {cardDef.title}</div>
      <div>Purpose: {cardDef.purpose}</div>
    </div>
  );
}
