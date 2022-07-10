/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { getSubCards } from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import Button from '../common/element/Button';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import { depthMax } from '../projects/edition/Editor';
import { fixedButtonStyle, voidStyle } from '../styling/style';
import CardCreator from './CardCreator';
import CardThumbWithSelector from './CardThumbWithSelector';

// TODO : nice className for div for empty slot (blank card)

interface ContentSubsProps {
  cardContent: CardContent;
  depth?: number;
  showEmptiness?: boolean;
  className?: string;
  subcardsContainerStyle?: string;
}
/* const tinyCard = css({
  width: '30px',
  height: '20px',
  borderRadius: '2px',
  boxShadow: '0px 0px 3px 1px rgba(0, 0, 0, 0.1)',
  margin: '0 2px',
}); */

const flexWrap = css({
  display: 'flex',
  justifyContent: 'space-evenly',
  flexWrap: 'wrap',
});

/* const gridCardsStyle = css({
  display: 'grid', 
  gridTemplateColumns: 'repeat(3, minmax(min-content, 1fr))', 
  justifyContent: 'stretch', 
  alignContent: 'stretch',
  justifyItems: 'stretch', 
  alignItems: 'stretch'}); */

export function gridCardsStyle(depth: number, inRootView: boolean) {
  if (inRootView) {
    if (depth === 1) {
      return css`
        display: grid;
        grid-template-columns: repeat(3, minmax(min-content, 1fr));
        justify-content: stretch;
        align-content: stretch;
        justify-items: stretch;
        align-items: stretch;
      `;
    }
    if (depth === 0) {
      return css`
        display: grid;
        grid-template-columns: repeat(2, minmax(min-content, 1fr));
        justify-content: stretch;
        align-content: stretch;
        justify-items: stretch;
        align-items: stretch;
      `;
    }
  } else {
    if (depth === 2) {
      return css`
        flex-grow: 1;
      `;
    }
    if (depth === 1) {
      return css`
        display: grid;
        grid-template-columns: repeat(3, minmax(min-content, 1fr));
        justify-content: stretch;
        align-content: stretch;
        justify-items: stretch;
        align-items: stretch;
      `;
    }
    if (depth === 0) {
      return css`
        width: auto;
        flex-grow: 1;
      `;
    }
  }
}

// Display sub cards of a parent
export default function ContentSubs({
  cardContent,
  depth = 1,
  showEmptiness = false,
  className,
  subcardsContainerStyle,
}: ContentSubsProps): JSX.Element {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isInRootView = !location.pathname.match(/card/);

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

  const orderAndFillSubCards = React.useMemo(() => {
    const orderedSubCards: (Card | null)[] = [];

    if (subCards != null) {
      // sort by index, and if no index, by id
      // cards without index appear after those with index, ordered by id
      const sortedSubCards = subCards.sort((a, b) => {
        if ((a.index || 0) === 0 && (b.index || 0) === 0) {
          return (a.id || 0) - (b.id || 0);
        }

        return (a.index || 1000) - (b.index || 1000);
      });

      // fill empty cards where needed
      let lastSeenIndex: number = 0;

      sortedSubCards.forEach(card => {
        lastSeenIndex++;

        if (card.index && card.index > 0) {
          while (lastSeenIndex < card.index) {
            orderedSubCards.push(null);
            lastSeenIndex++;
          }
        }

        orderedSubCards.push(card);
      });
    }

    return orderedSubCards;
  }, [subCards]);

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
            parentCardContent={cardContent}
            customButton={
              <Button icon={faPlus} clickable>
                Add the first card
              </Button>
            }
            className={css({ display: 'block' })}
          />
        </div>
      );
    } else {
      return depth > 0 ? (
        <div
          className={cx(
            flexWrap,
            css({ flexDirection: 'column', alignItems: 'stretch', flexGrow: 1 }),
            className,
          )}
        >
          <div className={cx(gridCardsStyle(depth - 1, isInRootView), subcardsContainerStyle)}>
            {orderAndFillSubCards.map(sub => (
              <>
                {sub == null ? (
                  <div
                    className={cx(
                      //rootViewCardsStyle(depth - 1, isInRootView),
                      css({
                        margin: '10px',
                        minHeight: '100px',
                      }),
                    )}
                  />
                ) : (
                  <CardThumbWithSelector depth={depth - 1} key={sub.id} card={sub} />
                )}
              </>
            ))}
          </div>
          <Flex justify="center">
            <CardCreator
              parentCardContent={cardContent}
              customButton={
                depth === depthMax ? (
                  location.pathname.match(/card\/\d+\/v\/\d+/) ? undefined : (
                    <Button icon={faPlus} className={fixedButtonStyle} clickable>
                      Add Card
                    </Button>
                  )
                ) : undefined
              }
            />
          </Flex>
        </div>
      ) : (
        <>
          {/* <div className={flexWrap}>
          {subCards.map(sub => (
            <div
              key={sub.id}
              className={cx(tinyCard, css({ backgroundColor: sub.color || 'var(--pictoGrey)' }))}
            >
            </div>
          ))}
        </div> */}
        </>
      );
    }
  }
}
