/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import {Card} from 'colab-rest-client';
import {css} from '@emotion/css';
import AutoSaveInput from '../common/AutoSaveInput';
import {Destroyer} from '../common/Destroyer';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import CardContent from './CardContent';

interface Props {
  card: Card;
}

// Display one card and allow to edit its color
export default ({card}: Props): JSX.Element => {
  const dispatch = useAppDispatch();

  const contents = useAppSelector(state => {
    if (card.id) {
      return state.cards.cards[card.id].contents
    } else {
      return null;
    }
  })

  if (contents === undefined) {
    if (card.id != null) {
      dispatch(API.getCardContents(card.id));
    }
  }

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
          borderTop: '1px solid grey',
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
          onChange={newValue => dispatch(API.updateCard({...card, color: newValue}))}
        />
        <div>
          {contents != null ? <div>
            {
              Object.values(contents).flatMap(content => content ? <CardContent key={content.id} cardContent={content} />: null)}
          </div> : <InlineLoading />}
        </div>
      </div>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        })}
      >
        <Destroyer
          onDelete={() => {
            dispatch(API.deleteCard(card));
          }}
        />
      </div>
    </div>
  );
};
