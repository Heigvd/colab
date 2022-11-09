/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card } from 'colab-rest-client';
import * as React from 'react';
import CardThumb from './CardThumb';
import VariantSelector from './VariantSelector';

interface CardThumbWithSelectorProps {
  className?: string;
  cardThumbClassName?: string;
  card: Card;
  depth?: number;
  mayOrganize?: boolean;
  showPreview?: boolean;
}

export default function CardThumbWithSelector({
  card,
  className,
  cardThumbClassName,
  depth = 1,
  mayOrganize,
  showPreview,
}: CardThumbWithSelectorProps): JSX.Element {
  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    return (
      <VariantSelector className={className} card={card} depth={depth}>
        {(variant, list) => (
          <>
            <CardThumb
              card={card}
              variant={variant}
              variants={list}
              showSubcards={true}
              depth={depth}
              mayOrganize={mayOrganize}
              showPreview={showPreview}
              className={cardThumbClassName}
            />
          </>
        )}
      </VariantSelector>
    );
  }
}
