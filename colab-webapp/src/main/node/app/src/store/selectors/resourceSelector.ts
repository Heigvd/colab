/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, Resource, ResourceRef } from 'colab-rest-client';
import { difference, uniq } from 'lodash';
import React from 'react';
import * as API from '../../API/api';
import {
  isActive1,
  isActive2,
  ResourceAndRef,
  ResourceCallContext,
} from '../../components/resources/resourcesCommonType';
import { useAppDispatch, useAppSelector } from '../hooks';
import { AvailabilityStatus, ColabState, LoadingStatus } from '../store';
import { selectCurrentProjectId } from './projectSelector';

interface ResourceAndChain {
  /**
   * the resource; undefined means does not exists if status is READY
   */
  targetResource: Resource | LoadingStatus;
  /**
   * references chain; first is the deepest
   */
  refChain: ResourceRef[];
}

function resolveRef(state: ColabState, ref: ResourceRef): ResourceAndChain {
  const result: ResourceAndChain = {
    targetResource: 'LOADING',
    refChain: [ref],
  };

  let current = ref;

  while (current != null) {
    if (current.targetId != null) {
      const target = state.resources.resources[current.targetId];
      if (entityIs(target, 'Resource')) {
        result.targetResource = target;
        return result;
      } else if (entityIs(target, 'ResourceRef')) {
        result.refChain.push(target);
        current = target;
      } else if (target != null) {
        // should load API.getAbstractResource, doesnt'it ?
        result.targetResource = target;
        return result;
      }
    } else {
      return result;
    }
  }
  return result;
}

function isDirect(contextInfo: ResourceCallContext, resource: Resource): boolean {
  if (contextInfo.kind === 'CardOrCardContent') {
    if (contextInfo.cardContentId != null && contextInfo.cardContentId === resource.cardContentId) {
      return true;
    } else if (contextInfo.cardId != null && contextInfo.cardId === resource.cardId) {
      return true;
    }
  } else if (
    contextInfo.kind === 'CardType' &&
    contextInfo.cardTypeId != null &&
    contextInfo.cardTypeId === resource.abstractCardTypeId
  ) {
    return true;
  }
  return false;
}

export const useResources = (
  contextInfo: ResourceCallContext,
): { resourcesAndRefs: ResourceAndRef[]; status: LoadingStatus } => {
  return useAppSelector(state => {
    const result: ResourceAndRef[] = [];

    let directResourcesOrRefId = undefined;
    let cardTypeId = 0;
    let cardId = 0;
    let cardContentId = 0;
    if (
      contextInfo.kind === 'CardOrCardContent' &&
      contextInfo.cardContentId != null &&
      contextInfo.cardId != null
    ) {
      // Note : no need to get the resource for the card
      // as every card content has a reference to each resource (or reference) of its card
      // so each resource of the card is already linked from the card content
      directResourcesOrRefId = state.resources.byCardContent[contextInfo.cardContentId];
      cardContentId = contextInfo.cardContentId;
      cardId = contextInfo.cardId;
    } else if (contextInfo.kind === 'CardType' && contextInfo.cardTypeId != null) {
      directResourcesOrRefId = state.resources.byCardType[contextInfo.cardTypeId];
      cardTypeId = contextInfo.cardTypeId;
    }

    if (directResourcesOrRefId === undefined) {
      return { resourcesAndRefs: [], status: 'NOT_INITIALIZED' };
    }

    if (Array.isArray(directResourcesOrRefId)) {
      directResourcesOrRefId.forEach(firstId => {
        const first = state.resources.resources[firstId];
        if (first != null) {
          if (entityIs(first, 'Resource')) {
            result.push({ targetResource: first, isDirectResource: true });
          } else if (entityIs(first, 'ResourceRef')) {
            const { targetResource, refChain } = resolveRef(state, first);
            if (entityIs(targetResource, 'Resource')) {
              const isDirectResource = isDirect(contextInfo, targetResource);

              result.push({
                targetResource: targetResource,
                isDirectResource,
                cardContentResourceRef: refChain.find(
                  resourceRef => resourceRef.cardContentId === cardContentId,
                ),
                cardResourceRef: refChain.find(resourceRef => resourceRef.cardId === cardId),
                cardTypeResourceRef: refChain.find(
                  resourceRef => resourceRef.abstractCardTypeId === cardTypeId,
                ),
              });
            }
          }
        }
      });

      return { resourcesAndRefs: result, status: 'READY' };
    } else {
      return { resourcesAndRefs: [], status: 'LOADING' };
    }
  });
};

export function useAndLoadResources(contextData: ResourceCallContext): {
  activeResources: ResourceAndRef[];
  ghostResources: ResourceAndRef[];
  status: LoadingStatus;
} {
  const dispatch = useAppDispatch();

  const { resourcesAndRefs: resources, status } = useResources(contextData);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      if (contextData.kind === 'CardOrCardContent' && contextData.cardContentId != null) {
        dispatch(API.getResourceChainForCardContentId(contextData.cardContentId));
      } else if (contextData.kind === 'CardType' && contextData.cardTypeId != null) {
        dispatch(API.getResourceChainForAbstractCardTypeId(contextData.cardTypeId));
      }
    }
  }, [contextData, dispatch, status]);

  const activeResources = resources.filter(resource => isActive1(resource));
  const ghostResources = difference(resources, activeResources);

  return { activeResources, ghostResources, status };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// nb resources
////////////////////////////////////////////////////////////////////////////////////////////////////

/* export const useNbOfResources = (contextInfo: ResourceCallContext): { nbResources: number } => {
  let result = 0;
  let directResourcesOrRefId = undefined;
  let cardTypeId = 0;
  return useAppSelector(state => {
    if (contextInfo.kind === ResourceContextScope.CardType && contextInfo.cardTypeId != null) {
      directResourcesOrRefId = state.resources.byCardType[contextInfo.cardTypeId];
      cardTypeId = contextInfo.cardTypeId;
      result = NaN;
      logger.info(state.resources.resources);
    }
    return { nbResources: result };
  });
}; */

/**
 * number + availability status
 */
export type NbAndStatus = {
  nb: number | undefined;
  status: AvailabilityStatus;
};

/**
 * fetch the number of resources
 *
 * @param context data needed to know what to fetch
 * @returns the nb of resources + the availability status
 */
const useNbActiveResources = (context: ResourceCallContext): NbAndStatus => {
  return useAppSelector(state => {
    const defaultResult = { nb: undefined };

    if (context.kind === 'CardType') {
      const ownerId = context.cardTypeId;

      if (ownerId != null) {
        const status = state.resources.statusByCardType[ownerId];

        if (status === undefined) {
          // nothing in store
          return { ...defaultResult, status: 'NOT_INITIALIZED' };
        } else if (status !== 'READY') {
          // we got an availability status
          return { ...defaultResult, status: status };
        } else {
          // great. we can get the data
          const resources = Object.values(state.resources.resources).flatMap(resource =>
            entityIs(resource, 'AbstractResource') &&
            resource.abstractCardTypeId === ownerId &&
            isActive2(resource)
              ? [resource]
              : [],
          );
          return {
            nb: resources.length,
            status: 'READY',
          };
        }
      }
    } else if (context.kind === 'CardOrCardContent') {
      const ownerId = context.cardContentId;

      if (ownerId != null) {
        const status = state.resources.statusByCardContent[ownerId];

        if (status === undefined) {
          // nothing in store
          return { ...defaultResult, status: 'NOT_INITIALIZED' };
        } else if (status !== 'READY') {
          // we got an availability status
          return { ...defaultResult, status: status };
        } else {
          // great. we can get the data
          const resources = Object.values(state.resources.resources).flatMap(resource =>
            entityIs(resource, 'AbstractResource') &&
            resource.cardContentId === ownerId &&
            isActive2(resource)
              ? [resource]
              : [],
          );
          return {
            nb: resources.length,
            status: 'READY',
          };
        }
      }
    }

    return { ...defaultResult, status: 'ERROR' };
  }); /* refEquals is fine */
};

/**
 * fetch and load (if needed) the number of resources
 *
 * @param context data needed to know what to fetch
 * @returns the nb of resources + the availability status
 */
export const useAndLoadNbActiveResources = (context: ResourceCallContext): NbAndStatus => {
  const dispatch = useAppDispatch();

  const { nb, status } = useNbActiveResources(context);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      if (context.kind === 'CardType' && context.cardTypeId) {
        dispatch(API.getResourceChainForAbstractCardTypeId(context.cardTypeId));
      } else if (context.kind === 'CardOrCardContent' && context.cardContentId) {
        dispatch(API.getResourceChainForCardContentId(context.cardContentId));
      }
    }
  }, [context, dispatch, status]);

  return { nb, status };
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// fetch all categories used in the current project
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Find list of all known categories
 */
function useResourceCategories(): string[] {
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  return useAppSelector(state => {
    return uniq(
      Object.values(state.resources.resources).flatMap(res => {
        if (entityIs(res, 'AbstractResource') && res.category) {
          const cardTypeOwnerOfRes = res.abstractCardTypeId;

          if (cardTypeOwnerOfRes == null) {
            // in case of card resource, add the category as it is in same project
            return res.category;
          } else {
            // in case of card type resource, add only if in same project
            const cardType = state.cardType.cardtypes[cardTypeOwnerOfRes];

            if (entityIs(cardType, 'AbstractCardType')) {
              if (cardType.projectId === currentProjectId) {
                return res.category;
              }
            }
          }
        }

        return [];
      }),
    ).sort();
  });
}

export function useAndLoadResourceCategories(): {
  categories: string[];
  status: AvailabilityStatus;
} {
  const dispatch = useAppDispatch();

  const categories = useResourceCategories();
  const status = useAppSelector(state => state.resources.allOfProjectStatus);
  const currentProjectId = useAppSelector(selectCurrentProjectId);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && currentProjectId) {
      dispatch(API.getDirectResourcesOfProject(currentProjectId));
    }
  }, [dispatch, currentProjectId, status]);

  if (status === 'READY') {
    return { categories, status };
  } else {
    return { categories: [], status };
  }
}

export function useAndLoadProjectResourcesStatus(): {
  status: AvailabilityStatus;
} {
  const dispatch = useAppDispatch();

  const status = useAppSelector(state => state.resources.allOfProjectStatus);
  const currentProjectId = useAppSelector(selectCurrentProjectId);
  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && currentProjectId) {
      dispatch(API.getDirectResourcesOfProject(currentProjectId));
    }
  }, [dispatch, currentProjectId, status]);

  if (status === 'READY') {
    return { status };
  } else {
    return { status };
  }
}
