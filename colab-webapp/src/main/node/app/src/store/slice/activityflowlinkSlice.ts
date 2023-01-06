/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { ActivityFlowLink } from 'colab-rest-client';
import * as API from '../../API/api';
import { processMessage } from '../../ws/wsThunkActions';
import { LoadingStatus } from '../store';

export interface ActivityFlowState {
  status: LoadingStatus;
  links: Record<number, ActivityFlowLink>;
  byCardNext: Record<number, { activityFlowIds: number[]; status: LoadingStatus }>;
  byCardPrev: Record<number, { activityFlowIds: number[]; status: LoadingStatus }>;
}

const initialState: ActivityFlowState = {
  status: 'NOT_INITIALIZED',
  links: {},
  byCardNext: {},
  byCardPrev: {},
};

const updateActivityFlow = (
  state: ActivityFlowState,
  activityFlow: ActivityFlowLink,
  defaultCardStatus?: LoadingStatus,
) => {
  if (activityFlow.id != null) {
    if (activityFlow.previousCardId) {
      if (defaultCardStatus != null && state.byCardPrev[activityFlow.previousCardId] == null) {
        state.byCardPrev[activityFlow.previousCardId] = {
          activityFlowIds: [],
          status: defaultCardStatus,
        };
      }
      const stateForPrevCard = state.byCardPrev[activityFlow.previousCardId];

      if (stateForPrevCard) {
        if (!stateForPrevCard.activityFlowIds.includes(activityFlow.id)) {
          stateForPrevCard.activityFlowIds.push(activityFlow.id);
        }
      }
    }

    if (activityFlow.nextCardId) {
      if (defaultCardStatus != null && state.byCardNext[activityFlow.nextCardId] == null) {
        state.byCardNext[activityFlow.nextCardId] = {
          activityFlowIds: [],
          status: defaultCardStatus,
        };
      }
      const stateForNextCard = state.byCardNext[activityFlow.nextCardId];
      if (stateForNextCard) {
        if (!stateForNextCard.activityFlowIds.includes(activityFlow.id)) {
          stateForNextCard.activityFlowIds.push(activityFlow.id);
        }
      }
    }

    state.links[activityFlow.id] = activityFlow;
  }
};

const removeActivityFlow = (state: ActivityFlowState, activityFlowId: number) => {
  const activityFlowState = state.links[activityFlowId];

  if (activityFlowState) {
    if (activityFlowState.nextCardId) {
      const stateForDestCard = state.byCardNext[activityFlowState.nextCardId];
      if (stateForDestCard) {
        const index = stateForDestCard.activityFlowIds.indexOf(activityFlowId);
        if (index >= 0) {
          stateForDestCard.activityFlowIds.splice(index, 1);
        }
      }
    }
    if (activityFlowState.previousCardId) {
      const stateForDestCard = state.byCardPrev[activityFlowState.previousCardId];
      if (stateForDestCard) {
        const index = stateForDestCard.activityFlowIds.indexOf(activityFlowId);
        if (index >= 0) {
          stateForDestCard.activityFlowIds.splice(index, 1);
        }
      }
    }
  }

  delete state.links[activityFlowId];
};

const activityFlowLinksSlice = createSlice({
  name: 'activityFlowLinksSlice',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.activityFlowLinks.updated.forEach(af => updateActivityFlow(state, af));
        action.payload.activityFlowLinks.deleted.forEach(indexEntry =>
          removeActivityFlow(state, indexEntry.id),
        );
      })
      .addCase(API.getAllActivityFlowLinks.pending, state => {
        state.status = 'LOADING';
      })
      .addCase(API.getAllActivityFlowLinks.fulfilled, (state, action) => {
        state.status = 'READY';
        action.payload.forEach(link => updateActivityFlow(state, link, 'READY'));
      })
      .addCase(API.getActivityFlowLinkFromCard.fulfilled, (state, action) => {
        state.byCardPrev[action.meta.arg] = {
          activityFlowIds: action.payload.flatMap(link => (link.id ? [link.id] : [])),
          status: 'READY',
        };

        action.payload.forEach(activityFlow => {
          if (activityFlow && activityFlow.id) {
            state.links[activityFlow.id] = activityFlow;
            const cardState = state.byCardNext[activityFlow.nextCardId!];
            if (cardState != null) {
              if (!cardState.activityFlowIds.includes(activityFlow.id)) {
                cardState.activityFlowIds.push(activityFlow.id);
              }
            }
          }
        });
      })

      .addCase(API.getActivityFlowLinkToCard.fulfilled, (state, action) => {
        state.byCardNext[action.meta.arg] = {
          activityFlowIds: action.payload.flatMap(link => (link.id ? [link.id] : [])),
          status: 'READY',
        };

        action.payload.forEach(activityFlow => {
          if (activityFlow && activityFlow.id) {
            state.links[activityFlow.id] = activityFlow;
            const cardState = state.byCardPrev[activityFlow.previousCardId!];
            if (cardState != null) {
              if (!cardState.activityFlowIds.includes(activityFlow.id)) {
                cardState.activityFlowIds.push(activityFlow.id);
              }
            }
          }
        });
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default activityFlowLinksSlice.reducer;
