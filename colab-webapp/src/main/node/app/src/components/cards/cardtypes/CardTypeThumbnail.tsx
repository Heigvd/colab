/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardType } from 'colab-rest-client';
import * as React from 'react';
import Thumbnail from '../../common/Thumbnail';
import { useBlock } from '../../live/LiveTextEditor';
import { borderRadius, cardShadow } from '../../styling/style';

interface Props {
  highlighted: boolean;
  cardType: CardType;
  onClick: (id: number) => void;
}

const defaultStyle = css({
  cursor: 'pointer',
  boxShadow: cardShadow,
  borderRadius: borderRadius,
  '&:hover': {
    backgroundColor: 'var(--primaryColorContrastShade)',
  },
});

const selected = cx(
  defaultStyle,
  css({
    backgroundColor: 'var(--primaryColor)',
    color: 'var(--bgColor)',
    '&:hover': {
      backgroundColor: 'var(--primaryColor)',
      color: 'var(--bgColor)',
    },
  }),
);

export default function CardTypeThumbnail({ cardType, highlighted, onClick }: Props): JSX.Element {
  const purpose = useBlock(cardType.purposeId);

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
        <div title={purpose?.textData || ''}>
          <div>{cardType.title}</div>
          <div>{cardType.tags.join('; ')}</div>
        </div>
      </Thumbnail>
    );
  }
}
