/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../API/api';
import { sortCardContents } from '../helper';
import { useLanguage } from '../i18n/I18nContext';
import { shallowEqual, useAppDispatch, useAppSelector } from '../store/hooks';
import { CardContentDetail } from '../store/slice/cardSlice';
import { LoadingStatus } from '../store/store';
import { selectCurrentProjectId } from './projectSelector';

export const useProjectRootCard = (projectId: number | null | undefined): Card | LoadingStatus => {
  const dispatch = useAppDispatch();

  const rootCard = useAppSelector(state => {
    if (projectId != null) {
      if (typeof state.cards.rootCardId === 'string') {
        if (state.cards.rootCardId === 'NOT_INITIALIZED') {
          return 'NOT_INITIALIZED';
        }
        return 'LOADING';
      } else {
        const cardDetail = state.cards.cards[state.cards.rootCardId];

        if (cardDetail != null) {
          const rootCard = cardDetail.card;
          if (rootCard != null) {
            return rootCard;
          } else {
            return 'LOADING';
          }
        } else {
          return 'NOT_INITIALIZED';
        }
      }
    }
    return 'NOT_INITIALIZED';
  });

  React.useEffect(() => {
    if (rootCard === 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getProjectStructure(projectId!));
    }
  }, [rootCard, projectId, dispatch]);

  return rootCard;
};

export const useCurrentProjectRootCard = (): Card | LoadingStatus => {
  const projectId = useAppSelector(selectCurrentProjectId);

  return useProjectRootCard(projectId);
};

export const useAllProjectCards = (): Card[] => {
  return useAppSelector(state => {
    const cards = Object.values(state.cards.cards)
      .map(cd => cd.card)
      .flatMap(c => (c != null ? [c] : []));
    return cards;
  });
};

export const useAllProjectCardTypes = (): number[] => {
  return useAppSelector(state => {
    const cardTypes = Object.values(state.cards.cards)
      .map(cd => cd.card?.cardTypeId)
      .flatMap(c => (c != null ? [c] : []));
    return cardTypes;
  });
};

export function useVariantsOrLoad(card?: Card): CardContent[] | null | undefined {
  const dispatch = useAppDispatch();
  const lang = useLanguage();

  return useAppSelector(state => {
    if (card?.id && state.cards.cards[card.id]) {
      const cardState = state.cards.cards[card.id]!;
      if (cardState.contents === undefined) {
        dispatch(API.getCardContents(card.id));
        return null;
      } else if (cardState.contents === null) {
        return null;
      } else {
        const contentState = state.cards.contents;
        return sortCardContents(
          cardState.contents.flatMap(contentId => {
            const content = contentState[contentId];
            return content && content.content ? [content.content] : [];
          }),
          lang,
        );
      }
    } else {
      return null;
    }
  }, shallowEqual);
}

export const useCard = (id: number | null | undefined): Card | 'LOADING' | undefined => {
  return useAppSelector(state => {
    if (id == null) {
      return undefined;
    }
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
  const dispatch = useAppDispatch();

  const content = useAppSelector(state => {
    if (id) {
      const cardDetail = state.cards.contents[id];

      if (cardDetail != null) {
        return cardDetail.content || 'LOADING';
      }
    }

    return undefined;
  });

  React.useEffect(() => {
    if (content === undefined && id != null) {
      dispatch(API.getCardContent(id));
    }
  }, [content, id, dispatch]);

  return content;
};

export interface Ancestor {
  card: Card | number | undefined | 'LOADING';
  content: CardContent | number | 'LOADING';
  last?: boolean;
  className?: string;
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

export const useSubCards = (cardContentId: number | null | undefined) => {
  return useAppSelector(state => {
    if (cardContentId) {
      const contentState = state.cards.contents[cardContentId];
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
};

export const useAndLoadSubCards = (cardContentId: number | null | undefined) => {
  const dispatch = useAppDispatch();
  const subCards = useSubCards(cardContentId);

  React.useEffect(() => {
    if (subCards === undefined) {
      if (cardContentId) {
        dispatch(API.getSubCards(cardContentId));
      }
    }
  }, [subCards, dispatch, cardContentId]);

  return subCards;
};
