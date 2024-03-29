/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, CardContent, ConversionStatus, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { DocumentOwnership } from '../../components/documents/documentCommonType';
import { sortSmartly } from '../../helper';
import { Language, useLanguage } from '../../i18n/I18nContext';
import { shallowEqual, useAppDispatch, useAppSelector } from '../hooks';
import { CardContentDetail, CardDetail } from '../slice/cardSlice';
import { ColabState, LoadingStatus } from '../store';
import { isAlive } from '../storeHelper';
import { selectCurrentProjectId } from './projectSelector';
import { compareById, deletionStatusOrder } from './selectorHelper';

// deal with dead and alive cards - should never be dead !
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

// deal with dead and alive cards - should never be dead !
const useCurrentProjectRootCard = (): Card | LoadingStatus => {
  const projectId = useAppSelector(selectCurrentProjectId);

  return useProjectRootCard(projectId);
};

// deal only with alive cards
const selectAllProjectCards = (state: ColabState): Card[] => {
  return Object.values(state.cards.cards)
    .map(cd => cd.card)
    .filter(card => card != null && isAlive(card))
    .flatMap(c => (c != null ? [c] : []));
};

// deal only with alive cards
export const useAllProjectCards = (): Card[] => {
  return useAppSelector(state => {
    return selectAllProjectCards(state);
  });
};

export const useAllProjectCardTypes = (): number[] => {
  return useAppSelector(state => {
    return Object.values(state.cards.cards)
      .map(cd => cd.card?.cardTypeId)
      .flatMap(c => (c != null ? [c] : []));
  });
};

// deal only with alive card contents
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
            return content && content.content && isAlive(content.content) ? [content.content] : [];
          })
          .sort((a, b) => compareCardContents(a, b, lang));
      }
    } else {
      return null;
    }
  }, shallowEqual);
}

/**
 * use default cardContent
 */
// deal only with alive card contents
export function useDefaultVariant(cardId: number): 'LOADING' | CardContent {
  const dispatch = useAppDispatch();
  const card = useCard(cardId);

  const variants = useVariantsOrLoad(card !== 'LOADING' ? card : undefined);

  React.useEffect(() => {
    if (card === undefined && cardId) {
      dispatch(API.getCard(cardId));
    }
  }, [card, cardId, dispatch]);

  if (card === 'LOADING' || card == null || variants == null) {
    return 'LOADING';
  } else if (variants.length === 0) {
    return 'LOADING';
  } else {
    return variants[0]!;
  }
}

// deal with dead and alive cards
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

// deal with dead and alive card contents
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
  cardContent: CardContent | number | undefined | 'LOADING';
  last?: boolean;
  className?: string;
}

// deal with dead and alive card and card contents
export const useAncestors = (card: Card | null | undefined): Ancestor[] => {
  return useAppSelector(state => {
    const ancestors: Ancestor[] = [];

    let currentCardContentId: number | null | undefined = card?.parentId;

    while (currentCardContentId != null) {
      const cardContentState: CardContentDetail | undefined =
        state.cards.contents[currentCardContentId];

      let parentCardContent: CardContent | number | 'LOADING' = currentCardContentId;
      let parentCard: Card | number | 'LOADING' | undefined = undefined;

      currentCardContentId = undefined;

      if (cardContentState != null) {
        if (cardContentState.content != null) {
          parentCardContent = cardContentState.content;
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
          parentCardContent = 'LOADING';
        }
      }

      ancestors.unshift({
        card: parentCard,
        cardContent: parentCardContent,
      });
    }

    return ancestors;
  }, shallowEqual);
};

// deal with dead and alive card contents
export const useParentCard = (cardId: number | null | undefined): Card | undefined => {
  const card = useCard(cardId);
  const parentCardContent = useCardContent(
    card != null && entityIs(card, 'Card') ? card.parentId : 0,
  );
  const parentCard = useCard(
    parentCardContent != null && entityIs(parentCardContent, 'CardContent')
      ? parentCardContent.cardId
      : 0,
  );

  if (parentCard != null && entityIs(parentCard, 'Card')) {
    return parentCard;
  }

  return undefined;
};

// deal with dead and alive card contents
export const useParentCardButNotRoot = (cardId: number | null | undefined): Card | undefined => {
  const parentCard = useParentCard(cardId);
  const rootCard = useCurrentProjectRootCard();

  if (parentCard == null) {
    return undefined;
  } else {
    if (entityIs(rootCard, 'Card') && rootCard.id != null && rootCard.id === parentCard.id) {
      return undefined;
    }

    return parentCard;
  }
};

// deal with alive cards
const useSubCards = (cardContentId: number | null | undefined): Card[] | null | undefined => {
  return useAppSelector(state => {
    if (cardContentId) {
      const contentState = state.cards.contents[cardContentId];
      if (contentState != null) {
        if (contentState.subs != null) {
          return contentState.subs
            .flatMap(cardId => {
              const cardState = state.cards.cards[cardId];
              return cardState && cardState.card ? [cardState.card] : [];
            })
            .filter(card => isAlive(card));
        } else {
          return contentState.subs;
        }
      }
    } else {
      return [];
    }
  }, shallowEqual);
};

// deal with alive cards
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

function compareCardsAtSameDepth(a: Card, b: Card): number {
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

// function compareCardAndDepths(a: CardAndDepth, b: CardAndDepth): number {
//   const byDepth = (a.depth || 0) - (b.depth || 0);
//   if (byDepth != 0) {
//     return byDepth;
//   }

//   return compareCardsAtSameDepth(a.card, b.card);
// }

/**
 * Convert CardContent status to comparable numbers
 */
function statusOrder(status: CardContent['status']) {
  if (status == null) {
    return 1;
  }
  switch (status) {
    case 'ACTIVE':
      return 2;
    case 'TO_VALIDATE':
      return 3;
    case 'VALIDATED':
      return 4;
    case 'REJECTED':
      return 5;
    case 'ARCHIVED':
      return 6;
    default:
      return 7;
  }
}

function compareCardContents(a: CardContent, b: CardContent, lang: Language): number {
  // sort by alive / bin / deleted
  const byDeletionStatus =
    deletionStatusOrder(a.deletionStatus) - deletionStatusOrder(b.deletionStatus);
  if (byDeletionStatus != 0) {
    return byDeletionStatus;
  }

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

interface CardDetailAndDepth {
  cardDetail: CardDetail;
  depth: number;
}

export interface CardAndDepth {
  card: Card;
  depth: number;
}

function convertToCardAndDepth(cardDetailAndDepth: CardDetailAndDepth[]) {
  return cardDetailAndDepth.map(cdp => {
    return { card: cdp.cardDetail.card!, depth: cdp.depth };
  });
}

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

// Deal only with alive cards
function selectAllProjectCardsButRootSorted(state: ColabState, lang: Language): CardAndDepth[] {
  const allCardDetailAndDepth = selectAllProjectCardsSorted(state, lang, 'ONLY_ALIVE');
  const result = convertToCardAndDepth(allCardDetailAndDepth);
  return result.slice(1);
}

type DeletionStatusMode = 'ALL' | 'ONLY_ALIVE';

function selectAllProjectCardsSorted(
  state: ColabState,
  lang: Language,
  mode: DeletionStatusMode,
): CardDetailAndDepth[] {
  const rootCardDetail = selectRootCardDetail(state);
  if (rootCardDetail == null || rootCardDetail.card == null) {
    return [];
  }

  return recursivelySelectSubCards(state, rootCardDetail, 0, lang, mode);
}

function recursivelySelectSubCards(
  state: ColabState,
  cardDetail: CardDetail,
  depth: number,
  lang: Language,
  mode: DeletionStatusMode,
): CardDetailAndDepth[] {
  const result: CardDetailAndDepth[] = [];

  if (cardDetail.card) {
    result.push({ cardDetail: cardDetail, depth });

    const childrenCards = getChildrenCards(state, cardDetail, lang, mode);
    if (childrenCards) {
      childrenCards.forEach(subCardDetail => {
        if (subCardDetail != null && subCardDetail.card != null) {
          const subResults = recursivelySelectSubCards(state, subCardDetail, depth + 1, lang, mode);
          subResults.forEach(cal => result.push(cal));
        }
      });
    }
  }

  return result;
}

function getChildrenCards(
  state: ColabState,
  cardDetail: CardDetail,
  lang: Language,
  mode: DeletionStatusMode,
): CardDetail[] {
  const cardContentIds = cardDetail.contents;

  if (cardContentIds == null) {
    return [];
  }

  const cardContents = cardContentIds
    .flatMap(cardContentId => {
      const cardContentDetail = state.cards.contents[cardContentId];
      return cardContentDetail ? cardContentDetail : [];
    })
    .filter(
      a => a.content != null && (mode === 'ALL' || (mode === 'ONLY_ALIVE' && isAlive(a.content))),
    )
    .sort((a, b) => compareCardContents(a.content!, b.content!, lang));
  const result: CardDetail[] = [];

  cardContents.forEach(cardContent => {
    const subs = [cardContent]
      .flatMap(cardContent => (cardContent ? cardContent.subs : []))
      .filter(a => a != null)
      .map(cardId => state.cards.cards[cardId!])
      //.filter(a =>  a != null && a.card != null)
      .flatMap(a => (a ? a : []))
      .filter(a => a.card != null && (mode === 'ALL' || (mode === 'ONLY_ALIVE' && isAlive(a.card))))
      .sort((a, b) => compareCardsAtSameDepth(a.card!, b.card!));
    subs.forEach(subCard => result.push(subCard));
  });

  return result;
}

// deal only with alive cards and card contents
export function useAllProjectCardsSorted(): CardAndDepth[] {
  const lang = useLanguage();
  return useAppSelector(state => {
    const data = selectAllProjectCardsSorted(state, lang, 'ONLY_ALIVE');
    return convertToCardAndDepth(data).filter(card => isAlive(card.card));
  });
}

export function useAllDeletedProjectCardsSorted(): Card[] {
  const lang = useLanguage();
  return useAppSelector(state => {
    const data = selectAllProjectCardsSorted(state, lang, 'ALL');
    return convertToCardAndDepth(data)
      .map(cad => cad.card)
      .filter(card => card.deletionStatus === 'BIN');
  });
}

// deal with leaves deleted card contents
// filter only these whose card is alive
export function useDeletedCardContentsToDisplaySorted(): CardContent[] {
  const lang = useLanguage();
  return useAppSelector(state => {
    const allCardDetailAndDepths = selectAllProjectCardsSorted(state, lang, 'ALL');
    const contentState = state.cards.contents;
    const cardContents = allCardDetailAndDepths
      .filter(cdp => cdp.cardDetail.card && isAlive(cdp.cardDetail.card))
      .flatMap(cdp => cdp.cardDetail.contents ?? [])
      .flatMap((contentId: number) => {
        const content = contentState[contentId];
        return content && content.content ? [content.content] : [];
      })
      .sort((a, b) => compareCardContents(a, b, lang));

    return cardContents.filter((cardContent: CardContent) => cardContent.deletionStatus === 'BIN');
  });
}

export function useAllProjectCardsButRootSorted(): CardAndDepth[] {
  const lang = useLanguage();
  return useAppSelector(state => {
    return selectAllProjectCardsButRootSorted(state, lang).filter(card => isAlive(card.card));
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export const useSortSubcardsWithPos = (subCards: Card[] | undefined | null): Card[] | undefined => {
  if (!subCards) {
    return undefined;
  } else {
    return subCards.sort(compareCardsAtSameDepth);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////

export function selectCardContentLexicalConversionStatus(
  state: ColabState,
  docOwnership: DocumentOwnership,
): ConversionStatus | null | undefined {
  if (docOwnership.kind === 'DeliverableOfCardContent') {
    const cardDetail = state.cards.contents[docOwnership.ownerId];

    return cardDetail?.content?.lexicalConversion;
  }

  return undefined;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export function selectIsDirectUnderRoot(state: ColabState, card: Card): boolean {
  const rootCardDetail = selectRootCardDetail(state);

  return (
    (
      rootCardDetail?.contents?.filter(rootCardContentId => rootCardContentId === card.parentId) ||
      []
    ).length > 0
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export function useIsAnyAncestorDeleted(card: Card): boolean {
  const ancestors = useAncestors(card);

  return ancestors.some(ancestor => entityIs(ancestor.card, 'Card') && !isAlive(ancestor.card));
}
