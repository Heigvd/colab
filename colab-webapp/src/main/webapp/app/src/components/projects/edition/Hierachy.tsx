/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { css } from '@emotion/css';
import InlineLoading from '../../common/InlineLoading';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { Card } from 'colab-rest-client';
import { cardShadow } from '../../styling/style';
import CardCreator from '../../cards/CardCreator';

const flexRow = css({
  display: 'flex',
  padding: '5px',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

const flexColumn = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  alignItems: 'flexStart',
  borderLeft: '1px solid grey',
  marginRight: '10px',
});

const leftDotted = css({
  borderLeft: '2px dotted grey',
  margin: '2px 0 2px 5px',
});

interface ThumbProps {
  children: JSX.Element;
  color: string;
}

const Thumb = ({ color, children }: ThumbProps): JSX.Element => {
  return (
    <div
      className={css({
        //            width: 'max-content',
        border: `1px solid lightgrey`,
        backgroundColor: color,
        borderRadius: '5px',
        boxShadow: cardShadow,
      })}
    >
      {children}
    </div>
  );
};

interface HierarchyDisplayProps {
  rootId: number;
}
/**
 *
 */
const Hierachy = (props: HierarchyDisplayProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const { project, status } = useProjectBeingEdited();

  const root = useAppSelector(state => {
    const rootState = state.cards.cards[props.rootId];
    if (rootState) {
      return rootState;
    }
    return undefined;
  });

  /**
   * Select card contents.
   * @return list of contents if they are known, undefined if they're unknown, null if loading is pending
   */
  const contents = useAppSelector(state => {
    if (root != null && root.card != null && root.card.id != null) {
      const card = state.cards.cards[root.card.id];
      if (card != null) {
        if (card.contents != null) {
          return Object.values(card.contents).map(contentId => {
            return state.cards.contents[contentId];
          });
        } else {
          return card.contents;
        }
      }
    }
  });

  const subs = useAppSelector(state => {
    const result: { [contentId: number]: (Card | undefined)[] | null | undefined } = {};

    if (contents != null) {
      contents.forEach(content => {
        if (content) {
          if (content.content != null) {
            const cId = content.content.id;
            if (cId != null) {
              if (content.subs != null) {
                result[cId] = content.subs.map(cardId => {
                  const sCard = state.cards.cards[cardId];
                  if (sCard != null && sCard.card != null) {
                    return sCard.card;
                  } else {
                    return undefined;
                  }
                });
              } else {
                result[cId] = content.subs;
              }
            }
          }
        }
      });
    }
    return result;
  });

  if (root != null && root.card && root.card.id && root.contents === undefined) {
    dispatch(API.getCardContents(root.card.id));
  }

  if (contents == null) {
    return <InlineLoading />;
  } else if (project == null) {
    return (
      <div>
        <i>Error: no project selected</i>
      </div>
    );
  } else if (status != 'READY') {
    return <InlineLoading />;
  } else {
    //    const variants = contents.flatMap(ccDetail =>
    //      ccDetail && ccDetail.content ? [ccDetail.content] : [],
    //    );
    return (
      <div className={leftDotted}>
        {contents.map(cardContent => {
          if (
            root != null &&
            root.card != null &&
            cardContent != null &&
            cardContent.content != null
          ) {
            let children: JSX.Element[] = [];
            if (cardContent.content.id) {
              const subcards = subs[cardContent.content.id];
              if (subcards === undefined) {
                dispatch(API.getSubCards(cardContent.content.id));
              }
              if (subcards != null) {
                children = subcards.flatMap(subcard =>
                  subcard && subcard.id ? [<Hierachy key={subcard.id} rootId={subcard.id} />] : [],
                );
              }
            }

            return (
              <div className={flexRow}>
                {project.rootCardId === props.rootId ? (
                  <Thumb color={'white'}>
                    <span>{project.name}</span>
                  </Thumb>
                ) : (
                  <Thumb color={root.card.color || 'white'}>
                    <span>{cardContent.content.title || 'untitled'}</span>
                  </Thumb>
                )}
                <div className={flexColumn}>
                  {children}
                  <div className={leftDotted}>
                    <Thumb color="#fff20">
                      <CardCreator parent={cardContent.content} />
                    </Thumb>
                  </div>
                </div>
              </div>
            );
          } else {
            return <InlineLoading />;
          }
        })}
      </div>
    );
  }
};

export default Hierachy;
