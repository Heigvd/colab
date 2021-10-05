/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import CardLayout from './CardLayout';
import ContentSubs from './ContentSubs';

interface Props {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
  depth?: number;
}

export default function CardThumb({
  card,
  depth = 1,
  showSubcards = true,
  variant,
  variants,
}: Props): JSX.Element {
  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    return (
      <CardLayout card={card} variant={variant} variants={variants}>
        <>
          <div
            className={css({
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            })}
          >
            <div>{card.title}</div>
            <div>{variants.length > 1 ? variant?.title ? <span>{variant.title}</span> : <i>untitled</i> : null}</div>
          </div>
          <div
            className={css({
              padding: '10px',
            })}
          >
            <div>
              {showSubcards ? (
                variant != null ? (
                  <ContentSubs depth={depth} cardContent={variant} />
                ) : (
                  <i>no content</i>
                )
              ) : null}
            </div>
          </div>
        </>
      </CardLayout>
    );
  }
}
