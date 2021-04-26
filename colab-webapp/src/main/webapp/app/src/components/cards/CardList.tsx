/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import IconButton from '../common/IconButton';
import CardDisplay from './CardDisplay';

export function CardList(): JSX.Element {
  const status = useAppSelector(state => state.cards.status);
  const cards = useAppSelector(state => Object.values(state.cards.cards));
  const dispatch = useAppDispatch();

  if (status === 'UNSET') {
    dispatch(API.initCards());
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else {
    return (
      <div>
        <div>
          {cards
            .flatMap(c => (c ? [c] : []))
            .sort((a, b) => (a.id || 0) - (b.id || 0))
            .map(card => (
              <CardDisplay key={card.id} card={card} />
            ))}
        </div>
        <div>
          <IconButton
            icon={faPlus}
            onClick={() => {
              dispatch(
                API.createCard({
                  '@class': 'Card',
                  index: 0,
                  color: '',
                }),
              );
            }}
          >
            Add a card
          </IconButton>
        </div>
      </div>
    );
  }
}
