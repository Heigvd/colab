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
import CardThumb from '../../cards/CardThumb';
import WithToolbar from '../../common/WithToolbar';
import CardCreator from '../../cards/CardCreator';

interface HierarchyDisplayProps {
  rootId: number;
}

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
    const variants = contents.flatMap(ccDetail =>
      ccDetail && ccDetail.content ? [ccDetail.content] : [],
    );
    return (
      <div
        className={css({
          display: 'flex',
          padding: '5px',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          //            alignItems: 'center',
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'stretch',
            borderRight: '1px dashed grey',
            paddingRight: '10px',
          })}
        >
          {project.rootCardId === props.rootId ? (
            <div>
              {contents[0] != null && contents[0].content ? (
                <WithToolbar toolbar={<CardCreator parent={contents[0].content} />}>
                  <span>{project.name}</span>
                </WithToolbar>
              ) : (
                <InlineLoading />
              )}
            </div>
          ) : (
            contents.map(cardContent => {
              if (
                root != null &&
                root.card != null &&
                cardContent != null &&
                cardContent.content != null
              ) {
                return (
                  <CardThumb
                    card={root.card}
                    variant={cardContent.content}
                    variants={variants}
                    showSubcards={false}
                  />
                );
              } else {
                return <InlineLoading />;
              }
            })
          )}
        </div>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            alignItems: 'stretch',
            borderLeft: '1px dashed orange',
          })}
        >
          {contents
            .flatMap(cardContent => {
              if (cardContent != null && cardContent.content != null) {
                if (cardContent.content.id) {
                  const subIds = subs[cardContent.content.id];
                  if (subIds === undefined) {
                    dispatch(API.getSubCards(cardContent.content.id));
                  }
                  if (subIds != null) {
                    return subIds;
                  } else {
                    return [];
                  }
                }
                //cardContent.subs.map();
              }
            })
            .map(card => {
              if (card != null && card.id != null) {
                return <Hierachy rootId={card.id} />;
              } else {
                return <InlineLoading />;
              }
            })}
        </div>
      </div>
    );
  }
};

export default Hierachy;
