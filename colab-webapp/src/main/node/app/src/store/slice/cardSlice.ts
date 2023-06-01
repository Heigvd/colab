/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { Card, CardContent } from 'colab-rest-client';
import * as API from '../../API/api';
import { processMessage } from '../../ws/wsThunkActions';
import { LoadingStatus } from '../store';

export interface CardDetail {
  card: Card | null;
  contents?: number[] | null;
}

export interface CardContentDetail {
  content: CardContent | null;
  subs?: number[] | null;
}

export interface CardState {
  status: LoadingStatus;
  contentStatus: LoadingStatus;
  rootCardId: number | LoadingStatus;
  cards: Record<number, CardDetail>;
  contents: Record<number, CardContentDetail>;
}

const initialState: CardState = {
  status: 'NOT_INITIALIZED',
  contentStatus: 'NOT_INITIALIZED',
  rootCardId: 'NOT_INITIALIZED',
  cards: {},
  contents: {},
};

const findCardByContentId = (contentId: number, state: CardState) => {
  const found = Object.values(state.cards).find(entry => {
    return entry.contents && entry.contents.indexOf(contentId) >= 0;
  });
  return found ? found.card : null;
};

const getOrCreateCardState = (state: CardState, cardId: number): CardDetail => {
  const cardState = state.cards[cardId];
  if (cardState != null) {
    return cardState;
  } else {
    const newState = { card: null };
    state.cards[cardId] = newState;
    return newState;
  }
};

const getOrCreateCardContentState = (
  state: CardState,
  cardContentId: number,
): CardContentDetail => {
  const cardState = state.contents[cardContentId];
  if (cardState != null) {
    return cardState;
  } else {
    const newState = { content: null };
    state.contents[cardContentId] = newState;
    return newState;
  }
};

const updateCard = (state: CardState, card: Card) => {
  const cardId = card.id;
  if (cardId != null) {
    const cardState = getOrCreateCardState(state, cardId);

    const prevParentId = cardState.card?.parentId;
    if (prevParentId != null && card.parentId != null && prevParentId != card.parentId) {
      // card moved to a new parent
      // remove from old one
      const prevParentState = state.contents[prevParentId];
      if (prevParentState?.subs) {
        const index = prevParentState.subs.indexOf(cardId);
        if (index >= 0) {
          prevParentState.subs.splice(index, 1);
        }
      }
    }

    cardState.card = card;

    const parentId = card.parentId;
    if (parentId != null) {
      // parent state is knonw, make sure the card is registered
      const parentState = state.contents[parentId];
      if (parentState != null) {
        if (parentState.subs != null && parentState.subs.indexOf(cardId) < 0) {
          parentState.subs.push(cardId);
        }
      }
    }
  }
};

const removeCard = (state: CardState, cardId: number) => {
  const cardState = state.cards[cardId];
  if (cardState) {
    if (cardState.card) {
      if (cardState.card.parentId) {
        const parentState = state.contents[cardState.card.parentId];
        if (parentState != null && parentState.subs != null) {
          const index = parentState.subs.indexOf(cardId);
          if (index >= 0) {
            parentState.subs.splice(index, 1);
          }
        }
      }
    }
  }
  delete state.cards[cardId];
};

const updateContent = (state: CardState, content: CardContent) => {
  if (content.id != null && content.cardId != null) {
    const cardState = state.cards[content.cardId];

    // do not create card detail
    if (cardState != null) {
      if (cardState.contents != null) {
        const index = cardState.contents.indexOf(content.id);
        if (index < 0) {
          cardState.contents.push(content.id);
        }
      }
    }
    if (content.id) {
      const contentState = getOrCreateCardContentState(state, content.id);
      contentState.content = content;
    }
  }
};

const removeContent = (state: CardState, contentId: number) => {
  const card = findCardByContentId(contentId, state);
  if (card != null && card.id != null) {
    const cardState = state.cards[card.id];
    if (cardState != null) {
      if (cardState.contents != null) {
        const index = cardState.contents.indexOf(contentId);
        if (index >= 0) {
          cardState.contents.splice(index, 1);
        }
      }
    }
  }
  delete state.contents[contentId];
};

const processAllCards = (state: CardState, cards: Card[]) => {
  cards.forEach(card => {
    const cardState = getOrCreateCardState(state, card.id!);
    cardState.card = card;
  });
  state.status = 'READY';
};

const processAllCardContents = (state: CardState, cardContents: CardContent[]) => {
  state.contentStatus = 'READY';
  Object.values(state.cards).forEach(cardState => {
    if (cardState.contents == null) {
      cardState.contents = [];
    }
  });
  cardContents.forEach(cc => {
    if (cc.id) {
      const contentState = getOrCreateCardContentState(state, cc.id);
      contentState.content = cc;
      const cardId = cc.cardId!;
      const cardState = getOrCreateCardState(state, cardId);
      if (cardState.contents == null) {
        cardState.contents = [];
      }
      if (cardState.contents.indexOf(cc.id) < 0) {
        cardState.contents.push(cc.id);
      }
    }
  });
};

const rebuildSubs = (state: CardState) => {
  // clear current subs
  Object.values(state.contents).forEach(v => {
    v.subs = [];
  });
  Object.values(state.cards).forEach(card => {
    const cardId = card.card?.id;
    const cardContentId = card.card?.parentId;
    if (cardId != null && cardContentId != null) {
      const contentState = getOrCreateCardContentState(state, cardContentId);
      if (contentState.subs == null) {
        contentState.subs = [];
      }
      contentState.subs.push(cardId);
    }
  });
};

const cardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.cards.upserted.forEach(card => updateCard(state, card));
        action.payload.cards.deleted.forEach(entry => removeCard(state, entry.id));
        action.payload.contents.upserted.forEach(content => updateContent(state, content));
        action.payload.contents.deleted.forEach(entry => removeContent(state, entry.id));
      })
      .addCase(API.getAllProjectCards.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.getAllProjectCards.fulfilled, (state, action) => {
        processAllCards(state, action.payload);
      })
      .addCase(API.getRootCardOfProject.pending, state => {
        state.rootCardId = 'LOADING';
      })
      .addCase(API.getRootCardOfProject.fulfilled, (state, action) => {
        if (action.payload?.id != null) {
          const cardId = action.payload.id;
          state.rootCardId = cardId;
          const cardState = getOrCreateCardState(state, cardId);
          cardState.card = action.payload;
        }
      })
      .addCase(API.getCard.pending, (state, action) => {
        const cardState = getOrCreateCardState(state, action.meta.arg);
        cardState.card = null;
      })
      .addCase(API.getCard.fulfilled, (state, action) => {
        if (action.payload?.id != null) {
          const cardState = getOrCreateCardState(state, action.meta.arg);
          cardState.card = action.payload;
        }
      })
      .addCase(API.getCardContent.pending, (state, action) => {
        const cardState = getOrCreateCardContentState(state, action.meta.arg);
        cardState.content = null;
      })
      .addCase(API.getCardContent.fulfilled, (state, action) => {
        if (action.payload?.id != null) {
          const contentState = getOrCreateCardContentState(state, action.meta.arg);
          contentState.content = action.payload;
        }
      })
      .addCase(API.getAllProjectCardContents.pending, state => {
        state.contentStatus = 'LOADING';
      })
      .addCase(API.getAllProjectCardContents.fulfilled, (state, action) => {
        processAllCardContents(state, action.payload);
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.getCardContents.pending, (state, action) => {
        // setting contents to null means loading
        const cardState = getOrCreateCardState(state, action.meta.arg);
        cardState.contents = null;
      })
      .addCase(API.getCardContents.fulfilled, (state, action) => {
        const cardId = action.meta.arg;
        const cardState = getOrCreateCardState(state, cardId);
        cardState.contents = action.payload.flatMap(cc => (cc.id ? [cc.id] : []));

        action.payload.forEach(cc => {
          if (cc && cc.id) {
            state.contents[cc.id] = {
              content: cc,
              subs: undefined,
            };
          }
        });
      })

      .addCase(API.getSubCards.pending, (state, action) => {
        // setting subs to null means loading
        const contentState = getOrCreateCardContentState(state, action.meta.arg);
        contentState.subs = null;
      })
      .addCase(API.getSubCards.fulfilled, (state, action) => {
        const cardContentId = action.meta.arg;

        const contentState = getOrCreateCardContentState(state, cardContentId);
        contentState.subs = action.payload.flatMap(card => (card.id ? [card.id] : []));

        action.payload.forEach(card => {
          if (card && card.id) {
            state.cards[card.id] = {
              card: card,
              contents: undefined,
            };
          }
        });
      })

      .addCase(API.getProjectStructure.pending, state => {
        state.status = 'LOADING';
        state.contentStatus = 'LOADING';
        state.rootCardId = 'LOADING';
      })
      .addCase(API.getProjectStructure.fulfilled, (state, action) => {
        if (action.payload != null) {
          processAllCards(state, action.payload.cards);
          processAllCardContents(state, action.payload.cardContents);
          rebuildSubs(state);
          state.rootCardId = action.payload.rootCardId;
        }
      })

      .addCase(API.closeCurrentSession.fulfilled, () => {
        return initialState;
      }),
});

export default cardsSlice.reducer;
