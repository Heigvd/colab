/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, CardContent, CardContentStatus } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../API/api';
import { sortSmartly } from '../helper';
import { Language, useLanguage } from '../i18n/I18nContext';
import { shallowEqual, useAppDispatch, useAppSelector } from '../store/hooks';
import { CardContentDetail, CardDetail } from '../store/slice/cardSlice';
import { ColabState, LoadingStatus } from '../store/store';
import { selectCurrentProjectId } from './projectSelector';
import { compareById } from './selectorHelper';

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

export const selectAllProjectCards = (state: ColabState): Card[] => {
  const cards = Object.values(state.cards.cards)
    .map(cd => cd.card)
    .flatMap(c => (c != null ? [c] : []));
  return cards;
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
        return cardState.contents
          .flatMap(contentId => {
            const content = contentState[contentId];
            return content && content.content ? [content.content] : [];
          })
          .sort((a, b) => compareCardContents(a, b, lang));
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sort
////////////////////////////////////////////////////////////////////////////////////////////////////

function compareCardsAtSameLevel(a: Card, b: Card): number {
  // sort by y
  const byY = (a.y || 0) - (b.y || 0);
  if (byY != 0) {
    return byY;
  }

  // sort by x
  const byX = (a.x || 0) - (b.x || 0);
  if (byX != 0) {
    return byX;
  }

  // then by id to be deterministic
  return compareById(a, b);
}

// function compareCardAndLevels(a: CardAndLevel, b: CardAndLevel): number {
//   const byLevel = (a.level || 0) - (b.level || 0);
//   if (byLevel != 0) {
//     return byLevel;
//   }

//   return compareCardsAtSameLevel(a.card, b.card);
// }

/**
 * Convert CardContent status to comparable numbers
 */
function statusOrder(status: CardContentStatus) {
  switch (status) {
    case 'ACTIVE':
      return 1;
    case 'PREPARATION':
      return 2;
    case 'VALIDATED':
      return 3;
    case 'POSTPONED':
      return 4;
    case 'ARCHIVED':
      return 5;
    case 'REJECTED':
      return 6;
    default:
      return 7;
  }
}

function compareCardContents(a: CardContent, b: CardContent, lang: Language): number {
  // sort by status
  const byStatus = statusOrder(a.status) - statusOrder(b.status);
  if (byStatus != 0) {
    return byStatus;
  }

  // then by title
  const byTitle = sortSmartly(a.title, b.title, lang);
  if (byTitle != 0) {
    return byTitle;
  }

  // then by id to be deterministic
  return compareById(a, b);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch cards
////////////////////////////////////////////////////////////////////////////////////////////////////

interface CardAndLevel {
  card: Card;
  level: number;
}

// interface CardDetailAndLevel {
//   card: CardDetail;
//   level: number;
// }

function selectRootCardId(state: ColabState): number | undefined {
  const rootCardIdOrStatus = state.cards.rootCardId;
  if (typeof rootCardIdOrStatus === 'number') {
    return rootCardIdOrStatus;
  }

  return undefined;
}

function selectRootCardDetail(state: ColabState): CardDetail | undefined {
  const rootCardId = selectRootCardId(state);
  if (rootCardId == null) {
    return undefined;
  }

  return state.cards.cards[rootCardId];
}

export function selectAllProjectCardsSorted(state: ColabState, lang: Language): CardAndLevel[] {
  const rootCardDetail = selectRootCardDetail(state);
  if (rootCardDetail == null || rootCardDetail.card == null) {
    return [];
  }

  return kj(state, rootCardDetail, 0, lang);
}

function kj(
  state: ColabState,
  cardDetail: CardDetail,
  level: number,
  lang: Language,
): CardAndLevel[] {
  const result: CardAndLevel[] = [];

  if (cardDetail.card) {
    result.push({ card: cardDetail.card, level });

    const childrenCards = getChildrenCards(state, cardDetail, lang);
    if (childrenCards) {
      childrenCards.forEach(subCardDetail => {
        if (subCardDetail != null && subCardDetail.card != null) {
          const subResults = kj(state, subCardDetail, level + 1, lang);
          subResults.forEach(cal => result.push(cal));
        }
      });
    }
  }

  return result;
}

function getChildrenCards(state: ColabState, cardDetail: CardDetail, lang: Language): CardDetail[] {
  const cardContentIds = cardDetail.contents;

  if (cardContentIds == null) {
    return [];
  }

  const cardContents = cardContentIds
    .flatMap(cardContentId => {
      const cardContentDetail = state.cards.contents[cardContentId];
      return cardContentDetail ? cardContentDetail : [];
    })
    .filter(a => a.content != null)
    .sort((a, b) => compareCardContents(a.content!, b.content!, lang));
  const result: CardDetail[] = [];

  cardContents.forEach(cardContent => {
    const subs = [cardContent]
      .flatMap(cardContent => (cardContent ? cardContent.subs : []))
      .filter(a => a != null)
      .map(cardId => state.cards.cards[cardId!])
      //.filter(a =>  a != null && a.card != null)
      .flatMap(a => (a ? a : []))
      .sort((a, b) => compareCardsAtSameLevel(a.card!, b.card!));
    subs.forEach(subCard => result.push(subCard));
  });

  return result;
}

export function useAllProjectCardsSorted(): CardAndLevel[] {
  const lang = useLanguage();
  return useAppSelector(state => {
    return selectAllProjectCardsSorted(state, lang);
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
