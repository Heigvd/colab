/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { CardType } from 'colab-rest-client';
import { css, cx } from '@emotion/css';
import Thumbnail from '../../common/Thumbnail';

interface Props {
  highlighted: boolean;
  cardType: CardType;
  onClick: (id: number) => void;
}

const defaultStyle = css({
  cursor: 'pointer',
  margin: '20px',
  width: 'max-content',
  border: '1px solid grey',
});

const selected = cx(
  defaultStyle,
  css({
    backgroundColor: 'var(--focusColor)',
    color: 'var(--bgColor)',
  }),
);

export default function CardTypeThumbnail({ cardType, highlighted, onClick }: Props): JSX.Element {
  if (cardType.id == null) {
    return <i>CardType without id is invalid...</i>;
  } else {
    return (
      <Thumbnail
        onClick={() => {
          if (cardType.id != null) {
            onClick(cardType.id);
          }
        }}
        className={highlighted ? selected : defaultStyle}
      >
        <span className={css({ padding: '10px' })} title={cardType.purpose || ''}>
          {cardType.title}
        </span>
      </Thumbnail>
    );
  }
}
