/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { css } from '@emotion/css';
import { CardType } from 'colab-rest-client';
import { cardShadow } from '../../styling/style';

interface DisplayProps {
  cardType: CardType;
}

const style = css({
  width: 'max-content',
  border: '1px solid grey',
  margin: '10px',
  padding: '10px',
  background: 'white',
  boxShadow: cardShadow,
});

export default function CardTypeDisplay({ cardType }: DisplayProps) {
  return (
    <div className={style}>
      <div>Title: {cardType.title}</div>
      <div>Purpose: {cardType.purpose}</div>
    </div>
  );
}
