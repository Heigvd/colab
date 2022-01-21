/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs, Resource, ResourceRef } from 'colab-rest-client';
import {
  ResourceAndRef,
  ResourceCallContext,
  ResourceContextScope,
} from '../components/resources/ResourceCommonType';
import { useAppSelector } from '../store/hooks';
import { ColabState, LoadingStatus } from '../store/store';

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
  if (contextInfo.kind === ResourceContextScope.CardOrCardContent) {
    if (contextInfo.cardContentId != null && contextInfo.cardContentId === resource.cardContentId) {
      return true;
    } else if (contextInfo.cardId != null && contextInfo.cardId === resource.cardId) {
      return true;
    }
  } else if (
    contextInfo.kind === ResourceContextScope.CardType &&
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
      contextInfo.kind === ResourceContextScope.CardOrCardContent &&
      contextInfo.cardContentId != null &&
      contextInfo.cardId != null
    ) {
      // Note : no need to get the resource for the card
      // as every card content has a reference to each resource (or reference) of its card
      // so each resource of the card is already linked from the card content
      directResourcesOrRefId = state.resources.byCardContent[contextInfo.cardContentId];
      cardContentId = contextInfo.cardContentId;
      cardId = contextInfo.cardId;
    } else if (
      contextInfo.kind === ResourceContextScope.CardType &&
      contextInfo.cardTypeId != null
    ) {
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
