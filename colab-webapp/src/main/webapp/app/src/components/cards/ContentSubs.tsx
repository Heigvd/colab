/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import { CardContent } from 'colab-rest-client';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import { getSubCards } from '../../API/api';
import { css, cx } from '@emotion/css';
import CardThumbWithSelector from './CardThumbWithSelector';

interface Props {
  cardContent: CardContent;
  depth?: number;
}
const tinyCard = css({
  width: '30px',
  height: '20px',
  border: '1px solid grey',
  borderRadius: '2px',
});

const flexWrap = css({
  display: 'flex',
  justifyContent: 'space-evenly',
  flexWrap: 'wrap',
});

// Display sub cards of a parent
export default ({ cardContent, depth = 1 }: Props): JSX.Element => {
  const dispatch = useAppDispatch();

  const subCards = useAppSelector(state => {
    if (cardContent.id) {
      const contentState = state.cards.contents[cardContent.id];
      if (contentState != null) {
        if (contentState.subs != null) {
          return contentState.subs.flatMap(cardId => {
            const cardState = state.cards.cards[cardId];
            return cardState && cardState.card ? [cardState.card] : [];
          });
        } else {
          return contentState.subs;
        }
      }
    } else {
      return [];
    }
  });

  if (subCards === undefined) {
    // dispatch(API.cmcc)
    if (cardContent.id) {
      dispatch(getSubCards(cardContent.id));
    }
  }

  if (subCards == null) {
    return <InlineLoading />;
  } else {
    return depth > 0 ? (
      <div className={flexWrap}>
        {subCards.map(sub => (
          <CardThumbWithSelector depth={depth - 1} key={sub.id} card={sub} />
        ))}
      </div>
    ) : (
      <div className={flexWrap}>
        {subCards.map(sub => (
          <div
            key={sub.id}
            className={cx(tinyCard, css({ borderColor: sub.color || 'grey' }))}
          ></div>
        ))}
      </div>
    );
  }
};
