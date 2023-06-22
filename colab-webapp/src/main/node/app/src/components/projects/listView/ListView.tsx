/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useAndLoadSubCards } from '../../../store/selectors/cardSelector';
import CardView from './CardView';

interface ListViewProps {
  content: CardContent;
}

export default function ListView({ content }: ListViewProps): JSX.Element {
  const subCards = useAndLoadSubCards(content.id);

  if (subCards !== undefined && subCards !== null) {
    subCards.sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });
  }

  if (subCards && subCards.length > 0) {
    return (
      <>
        {subCards.map(card => (
          <div key={card.id} className={css({ width: '100%' })}>
            <CardView card={card} />
          </div>
        ))}
      </>
    );
  }

  return <></>;
}
