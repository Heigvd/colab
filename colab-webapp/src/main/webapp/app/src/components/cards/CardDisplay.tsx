/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import { Card } from 'colab-rest-client';
import { css } from '@emotion/css';
import AutoSaveInput from '../common/AutoSaveInput';
import { Destroyer } from '../common/Destroyer';
import { useAppDispatch } from '../../store/hooks';

interface Props {
  card: Card;
}

// Display one card and allow to edit its color
export default ({ card }: Props): JSX.Element => {
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
        <AutoSaveInput
          inputType="TEXTAREA"
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
