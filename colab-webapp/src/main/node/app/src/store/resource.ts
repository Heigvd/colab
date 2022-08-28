/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { AbstractResource, entityIs } from 'colab-rest-client';
import * as API from '../API/api';
import { mapById } from '../helper';
import { processMessage } from '../ws/wsThunkActions';
import { AvailabilityStatus, LoadingStatus } from './store';

export interface ResourceState {
  resources: Record<number, AbstractResource | LoadingStatus>;

  byCardType: Record<number, number[] | LoadingStatus>;
  byCardContent: Record<number, number[] | LoadingStatus>;

  /** did we load the resources of a card type */
  statusByCardType: Record<number, AvailabilityStatus>;
  /** did we load the resources of a card content */
  statusByCardContent: Record<number, AvailabilityStatus>;

  /** did we load all the resources of the project */
  allOfProjectStatus: AvailabilityStatus;
}

const initialState: ResourceState = {
  resources: {},
  byCardType: {},
  byCardContent: {},

  statusByCardType: {},
  statusByCardContent: {},

  allOfProjectStatus: 'NOT_INITIALIZED',
};

const updateResource = (state: ResourceState, resource: AbstractResource) => {
  if (resource.id) {
    state.resources[resource.id] = resource;

    if (resource.cardContentId != null) {
      const cardContentId = resource.cardContentId;
      const stateForCardContent = state.byCardContent[cardContentId];
      if (Array.isArray(stateForCardContent)) {
        if (stateForCardContent.indexOf(resource.id) < 0) {
          stateForCardContent.push(resource.id);
        }
      }
    }

    if (resource.abstractCardTypeId != null) {
      const cardTypeId = resource.abstractCardTypeId;
      const stateForCardType = state.byCardType[cardTypeId];
      if (Array.isArray(stateForCardType)) {
        if (stateForCardType.indexOf(resource.id) < 0) {
          stateForCardType.push(resource.id);
        }
      }
    }
  }
};

const removeResource = (state: ResourceState, resourceId: number) => {
  const resourceOrRef = state.resources[resourceId];

  if (resourceOrRef != null && entityIs(resourceOrRef, 'AbstractResource')) {
    if (resourceOrRef.cardContentId != null) {
      const cardContentId = resourceOrRef.cardContentId;
      const stateForCardContent = state.byCardContent[cardContentId];
      if (Array.isArray(stateForCardContent)) {
        const index = stateForCardContent.indexOf(resourceId);
        if (index >= 0) {
          stateForCardContent.splice(index, 1);
        }
      }
    }

    if (resourceOrRef.abstractCardTypeId != null) {
      const cardTypeId = resourceOrRef.abstractCardTypeId;
      const stateForCardType = state.byCardType[cardTypeId];
      if (Array.isArray(stateForCardType)) {
        const index = stateForCardType.indexOf(resourceId);
        if (index >= 0) {
          stateForCardType.splice(index, 1);
        }
      }
    }
  }

  delete state.resources[resourceId];
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.resources.updated.forEach(resource => updateResource(state, resource));
        action.payload.resources.deleted.forEach(entry => removeResource(state, entry.id));
      })
      .addCase(API.getAbstractResource.pending, (state, action) => {
        state.resources[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getAbstractResource.fulfilled, (state, action) => {
        updateResource(state, action.payload);
      })
      .addCase(API.getResourceChainForCardContentId.pending, (state, action) => {
        const cardContentId = action.meta.arg;
        state.byCardContent[cardContentId] = 'LOADING';
        state.statusByCardContent[cardContentId] = 'LOADING';
      })
      .addCase(API.getResourceChainForCardContentId.fulfilled, (state, action) => {
        const cardContentId = action.meta.arg;
        state.byCardContent[cardContentId] = [];
        action.payload.forEach(resourceChain => {
          if (resourceChain && resourceChain.length > 0) {
            state.resources = { ...state.resources, ...mapById(resourceChain) };

            const directResource = resourceChain[0];
            if (directResource && directResource.id) {
              (state.byCardContent[cardContentId] as Array<number>).push(directResource.id);
            }
          }
        });
        state.statusByCardContent[cardContentId] = 'READY';
      })
      .addCase(API.getResourceChainForCardContentId.rejected, (state, action) => {
        const cardContentId = action.meta.arg;
        state.statusByCardContent[cardContentId] = 'ERROR';
      })
      .addCase(API.getResourceChainForAbstractCardTypeId.pending, (state, action) => {
        const cardTypeId = action.meta.arg;
        state.byCardType[cardTypeId] = 'LOADING';
        state.statusByCardType[cardTypeId] = 'LOADING';
      })
      .addCase(API.getResourceChainForAbstractCardTypeId.fulfilled, (state, action) => {
        const cardTypeId = action.meta.arg;
        state.byCardType[cardTypeId] = [];
        action.payload.forEach(resourceChain => {
          if (resourceChain && resourceChain.length > 0) {
            state.resources = { ...state.resources, ...mapById(resourceChain) };

            const directResource = resourceChain[0];
            if (directResource && directResource.id) {
              (state.byCardType[cardTypeId] as Array<number>).push(directResource.id);
            }
          }
        });
        state.statusByCardType[cardTypeId] = 'READY';
      })
      .addCase(API.getResourceChainForAbstractCardTypeId.rejected, (state, action) => {
        const cardTypeId = action.meta.arg;
        state.statusByCardType[cardTypeId] = 'ERROR';
      })
      .addCase(API.getDirectResourcesOfProject.pending, state => {
        state.allOfProjectStatus = 'LOADING';
      })
      .addCase(API.getDirectResourcesOfProject.fulfilled, (state, action) => {
        state.resources = { ...state.resources, ...mapById(action.payload) };
        state.allOfProjectStatus = 'READY';
      })
      .addCase(API.getDirectResourcesOfProject.rejected, state => {
        state.allOfProjectStatus = 'ERROR';
      })
      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default resourcesSlice.reducer;
