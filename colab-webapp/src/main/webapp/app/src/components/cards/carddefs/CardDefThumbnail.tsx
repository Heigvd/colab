/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { CardDef } from 'colab-rest-client';
import { css, cx } from '@emotion/css';
import Thumbnail from '../../common/Thumbnail';

interface Props {
  highlighted: boolean;
  cardDef: CardDef;
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
    color: 'var(--bgColor)'
  }),
);

export default function CardDefThumbnail({cardDef, highlighted, onClick}: Props): JSX.Element {
  if (cardDef.id == null) {
    return <i>CardDef without id is invalid...</i>;
  } else {
    return (
      <Thumbnail
        onClick={() => {
          if (cardDef.id != null) {
            onClick(cardDef.id);
          }
        } }
        className={highlighted ? selected : defaultStyle}
      >
        <span className={css({padding: "10px"})}title={cardDef.purpose || ''}>{cardDef.title}</span>
      </Thumbnail>
    );
  }
};
