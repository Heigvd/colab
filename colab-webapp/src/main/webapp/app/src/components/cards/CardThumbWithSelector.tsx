/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { Card } from 'colab-rest-client';
import VariantSelector from './VariantSelector';
import CardThumb from './CardThumb';

interface Props {
  card: Card;
  depth?: number;
}

export default ({ card, depth = 1 }: Props): JSX.Element => {
  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    return (
      <VariantSelector card={card}>
        {(variant, list) => (
          <CardThumb
            card={card}
            variant={variant}
            variants={list}
            showSubcards={true}
            depth={depth}
          />
        )}
      </VariantSelector>
    );
  }
};
