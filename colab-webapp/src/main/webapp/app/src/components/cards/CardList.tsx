/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Card } from 'colab-rest-client';
import { css } from '@emotion/css';
import { iconButton, buttonStyle } from '../styling/style';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import AutoSaveTextEditor from '../common/AutoSaveTextEditor';
import { Destroyer } from '../common/Destroyer';

interface Props {
  card: Card;
}

// Display one card and allow to edit its color
const CardDisplay = ({ card }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  return (
    <div
      className={css({
        margin: '20px',
        width: 'max-content',
        border: `2px solid ${card.color}`,
        borderRadius: '20px',
        padding: '10px',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderBottom: '1px solid grey',
        })}
      >
        <span className={css({})}>Card #{card.id}</span>
      </div>
      <div
        className={css({
          margin: '10px',
        })}
      >
        <AutoSaveTextEditor
          value={card.color || ''}
          onChange={newValue => dispatch(API.updateCard({ ...card, color: newValue }))}
        />
        <Destroyer
          onDelete={() => {
            dispatch(API.deleteCard(card));
          }}
        />
      </div>
    </div>
  );
};

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
            .sort((a, b) => (a.id || 0) - (b.id || 0))
            .map(card => (
              <CardDisplay key={card.id} card={card} />
            ))}
        </div>
        <div>
          <span
            className={buttonStyle}
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
            <FontAwesomeIcon className={iconButton} icon={faPlus} />
            Add a card
          </span>
        </div>
      </div>
    );
  }
}
