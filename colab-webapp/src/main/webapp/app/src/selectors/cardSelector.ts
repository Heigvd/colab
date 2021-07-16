/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, CardContent } from 'colab-rest-client';
import { CardContentDetail } from '../store/card';
import { shallowEqual, useAppSelector } from '../store/hooks';

export const useCard = (id: number): Card | 'LOADING' | undefined => {
  return useAppSelector(state => {
    const cardDetail = state.cards.cards[id];

    if (cardDetail != null) {
      return cardDetail.card || 'LOADING';
    } else {
      return undefined;
    }
  });
};

export const useCardContent = (
  id: number | null | undefined,
): CardContent | undefined | 'LOADING' => {
  return useAppSelector(state => {
    if (id) {
      const cardDetail = state.cards.contents[id];

      if (cardDetail != null) {
        return cardDetail.content || 'LOADING';
      }
    }

    return undefined;
  });
};

export interface Ancestor {
  card: Card | number | undefined | 'LOADING';
  content: CardContent | number | 'LOADING';
}

export const useAncestors = (contentId: number | null | undefined): Ancestor[] => {
  return useAppSelector(state => {
    const ancestors: Ancestor[] = [];

    let currentCardContentId: number | null | undefined = contentId;

    while (currentCardContentId != null) {
      const cardContentState: CardContentDetail | undefined =
        state.cards.contents[currentCardContentId];

      let parentContent: CardContent | number | 'LOADING' = currentCardContentId;
      let parentCard: Card | number | 'LOADING' | undefined = undefined;

      currentCardContentId = undefined;

      if (cardContentState != null) {
        if (cardContentState.content != null) {
          parentContent = cardContentState.content;
          const parentCardId = cardContentState.content.cardId;

          if (parentCardId != null) {
            parentCard = parentCardId;
            const cardState = state.cards.cards[parentCardId];
            if (cardState != null) {
              if (cardState.card != null) {
                parentCard = cardState.card;
                currentCardContentId = cardState.card.parentId || undefined;
              } else {
                parentCard = 'LOADING';
              }
            }
          }
        } else {
          parentContent = 'LOADING';
        }
      }

      ancestors.unshift({
        card: parentCard,
        content: parentContent,
      });
    }

    return ancestors;
  }, shallowEqual);
};
