/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import { getSubCards } from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import Button from '../common/Button';
import InlineLoading from '../common/InlineLoading';
import { depthMax } from '../projects/edition/Editor';
import { fixedButtonStyle } from '../styling/style';
import CardCreator from './CardCreator';
import CardThumbWithSelector from './CardThumbWithSelector';

interface Props {
  cardContent: CardContent;
  depth?: number;
  showEmptiness?: boolean;
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

const voidStyle = css({
  minHeight: '150px',
  background:
    'repeating-Linear-gradient(45deg,transparent,transparent 5px,#e4e4e4 5px,#e4e4e4 10px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

// Display sub cards of a parent
export default function ContentSubs({
  cardContent,
  depth = 1,
  showEmptiness = false,
}: Props): JSX.Element {
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
  }, shallowEqual);

  React.useEffect(() => {
    if (subCards === undefined) {
      // dispatch(API.cmcc)
      if (cardContent.id) {
        dispatch(getSubCards(cardContent.id));
      }
    }
  }, [subCards, dispatch, cardContent.id]);

  if (subCards == null) {
    return <InlineLoading />;
  } else {
    if (subCards.length === 0 && showEmptiness) {
      return (
        <div className={voidStyle}>
          <p>This project has no card yet. Add some to begin this co-design journey!</p>
          <CardCreator 
            parent={cardContent} 
            customButton={<Button 
                label={<><FontAwesomeIcon icon={faPlus} /> Add the first card</>} 
                title="Add first card"
                clickable
                />}
                className={css({display: 'block'})}
          />
        </div>
      );
    } else {
      return depth > 0 ? (
        <div className={flexWrap}>
          {subCards.map(sub => (
            <CardThumbWithSelector depth={depth - 1} key={sub.id} card={sub} />
          ))}
          <CardCreator 
            parent={cardContent} 
            customButton={ 
              depth === depthMax 
              ? <Button 
                label={<><FontAwesomeIcon icon={faPlus} /> Add Card</>} 
                title="Add Card"
                className={fixedButtonStyle}
                clickable
                />
              : undefined 
            } 
          />
        </div>
      ) : (
        <div className={flexWrap}>
          {subCards.map(sub => (
            <div
              key={sub.id}
              className={cx(tinyCard, css({ backgroundColor: sub.color || 'grey' }))}
            ></div>
          ))}
        </div>
      );
    }
  }
}
