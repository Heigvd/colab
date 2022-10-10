/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CardType as CardTypeOnly, CardTypeRef, entityIs } from 'colab-rest-client';
import { uniq } from 'lodash';
import * as React from 'react';
import * as API from '../API/api';
import { useLanguage } from '../i18n/I18nContext';
import { customColabStateEquals, useAppDispatch, useAppSelector } from '../store/hooks';
import { AvailabilityStatus, ColabState } from '../store/store';
import { CardTypeAllInOne, CardTypeAndStatus } from '../types/cardTypeDefinition';
import { useProjectBeingEdited } from './projectSelector';

////////////////////////////////////////////////////////////////////////////////////////////////////
// useful stuff to make a convenient card type for the client side
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Turn a card type from a server side theme
 * into a convenient theme for the client side
 *
 * @param cardType the card type, as seen by the server side (it is on it's own, no reference)
 *
 * @returns the card type, as conveninent for the client side
 */
function makeCardTypeOnOneSOwn(cardType: CardTypeOnly): CardTypeAllInOne {
  return {
    kind: 'own',

    id: cardType.id,
    ownId: cardType.id,
    cardTypeId: cardType.id,

    deprecated: cardType.deprecated,

    published: cardType.published,

    title: cardType.title,
    purposeId: cardType.purposeId,
    tags: cardType.tags,

    trackingDataCT: cardType.trackingData,

    projectId: cardType.projectId,
  };
}

/**
 * Turn a card type with a reference from a server side theme
 * into a convenient theme for the client side
 *
 * @param ref      the starting reference as seen by the server side
 * @param refChain the references chain from the start reference to the concrete card type
 * @param cardType the targeted concrete card type as seen by the server side
 *
 * @returns the card type, containing needed data from the references,
 *          as convenient for the client side
 */
function makeCardTypeWithRef(
  ref: CardTypeRef,
  refChain: CardTypeRef[],
  cardType: CardTypeOnly,
): CardTypeAllInOne {
  return {
    kind: 'referenced',

    id: ref.id,
    ownId: ref.id,
    cardTypeId: cardType.id,

    refChain: refChain,

    deprecated: ref.deprecated, // the most important is the one of the reference
    deprecatedCT: cardType.deprecated,

    published: ref.published, // the most important is the one of the reference
    publishedCT: cardType.published,

    title: cardType.title,
    purposeId: cardType.purposeId,
    tags: cardType.tags,

    trackingDataCTRef: ref.trackingData,
    trackingDataCT: cardType.trackingData,

    projectId: ref.projectId,
    projectIdCT: cardType.projectId,
  };
}

/**
 * Card type reference, with all the references chain and the targeted card type
 */
interface ExpandedCardType {
  /**
   * the starting reference
   */
  ref: CardTypeRef;

  /**
   * references chain
   * the first is the deepest (i.e. the starting reference)
   */
  refChain: CardTypeRef[];

  /**
   * the targeted card type
   * undefined means does not exists
   */
  cardType: CardTypeOnly | undefined;
}

/**
 * expand the card type reference until the concrete card type
 *
 * @param state the colab state
 * @param ref   the card type reference
 *
 * @returns the targeted card type + references + the availability status
 */
function expandRef(state: ColabState, ref: CardTypeRef): ExpandedCardType | AvailabilityStatus {
  const refChain = [ref];

  let current: CardTypeRef = ref;

  while (current) {
    if (current.targetId) {
      const targetState = state.cardType.cardtypes[current.targetId];

      if (entityIs(targetState, 'CardType')) {
        // we found the card type, return what we got
        return { ref, refChain, cardType: targetState };
      } else if (entityIs(targetState, 'CardTypeRef')) {
        // still a reference, go further
        refChain.push(targetState);
        current = targetState;
      } else if (targetState === undefined) {
        // some card type / reference could not be found, inform with an availability status
        return 'NOT_INITIALIZED';
      } else {
        // some card type / reference gave an availability status, return it
        return targetState;
      }
    } else {
      return 'ERROR';
    }
  }

  return 'ERROR';
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// use and load a card type + references chain
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * fetch the card type + target card type + references
 *
 * @param id the id of the card type / reference we want
 *
 * @returns the requested card type + references (if found) + the availability status
 */
function useCardType(id: number | null | undefined): CardTypeAndStatus {
  return useAppSelector(state => {
    const defaultResult = { cardType: undefined };

    if (id != null) {
      const directCardTypeOrRef = state.cardType.cardtypes[id];

      if (entityIs(directCardTypeOrRef, 'CardType')) {
        // it is directly a card type
        return { cardType: makeCardTypeOnOneSOwn(directCardTypeOrRef), status: 'READY' };
      } else if (entityIs(directCardTypeOrRef, 'CardTypeRef')) {
        // it is a card type reference, retrieve the targeted card type
        const resolved = expandRef(state, directCardTypeOrRef);
        if (typeof resolved === 'string') {
          return { ...defaultResult, status: resolved };
        } else if (resolved.cardType) {
          return {
            cardType: makeCardTypeWithRef(resolved.ref, resolved.refChain, resolved.cardType),
            status: 'READY',
          };
        }
      } else if (typeof directCardTypeOrRef === 'string') {
        // it is an availability status, just transmit
        return { ...defaultResult, status: directCardTypeOrRef };
      } else {
        // nothing found
        return { ...defaultResult, status: 'NOT_INITIALIZED' };
      }
    }

    // there was an error / the state is inconsistent
    return { ...defaultResult, status: 'ERROR' };
  }, customColabStateEquals);
}

/**
 * fetch (and load if needed) the card type + target card type + references
 *
 * @param id the id of the card type / reference we want
 *
 * @returns the requested card type + references (if found) + the availability status
 */
export function useAndLoadCardType(id: number | null | undefined): CardTypeAndStatus {
  const dispatch = useAppDispatch();

  const { cardType, status } = useCardType(id);

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && id != null) {
      dispatch(API.getExpandedCardType(id));
    }
  }, [status, dispatch, id]);

  return { cardType, status };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// All card types defined in the current project
////////////////////////////////////////////////////////////////////////////////////////////////////

function useProjectCardTypes(): CardTypeAllInOne[] {
  const lang = useLanguage();

  return useAppSelector(state => {
    const result: CardTypeAllInOne[] = [];

    const currentProjectId = state.projects.editing;

    if (currentProjectId) {
      Object.values(state.cardType.cardtypes).forEach(act => {
        if (entityIs(act, 'AbstractCardType')) {
          if (act.projectId === currentProjectId) {
            if (entityIs(act, 'CardTypeRef')) {
              const resolved = expandRef(state, act);
              if (typeof resolved !== 'string' && resolved.cardType) {
                result.push(
                  makeCardTypeWithRef(resolved.ref, resolved.refChain, resolved.cardType),
                );
              }
            } else {
              result.push(makeCardTypeOnOneSOwn(act));
            }
          }
        }
      });
    }

    return result.sort((a, b) => {
      return (a.title ?? '').localeCompare(b.title ?? '', lang);
    });
  }, customColabStateEquals);
}

export function useAndLoadProjectCardTypes(): {
  cardTypes: CardTypeAllInOne[];
  status: AvailabilityStatus;
} {
  const dispatch = useAppDispatch();

  const cardTypes = useProjectCardTypes();
  const status = useAppSelector(state => state.cardType.currentProjectStatus);
  const { project } = useProjectBeingEdited();
  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED' && project) {
      dispatch(API.getProjectCardTypes(project));
    }
  }, [dispatch, project, status]);

  if (status === 'READY') {
    return { cardTypes, status: status };
  } else {
    return { cardTypes: [], status: status };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// All available card types that could be used in the current project
////////////////////////////////////////////////////////////////////////////////////////////////////

function usePublishedCardTypes(): CardTypeAllInOne[] {
  return useAppSelector(state => {
    return Object.values(state.cardType.cardtypes).flatMap(ct => {
      return entityIs(ct, 'CardType') && ct.published ? [makeCardTypeOnOneSOwn(ct)] : [];
    });
  }, customColabStateEquals);
}

export function useAndLoadAvailableCardTypes(): {
  cardTypes: CardTypeAllInOne[];
  status: AvailabilityStatus;
} {
  const dispatch = useAppDispatch();

  const { project: currentProject } = useProjectBeingEdited();

  const statusPublished = useAppSelector(state => state.cardType.availablePublishedStatus);
  const statusCurrentProject = useAppSelector(state => state.cardType.currentProjectStatus);

  const allPublishedCardTypes = usePublishedCardTypes();
  const currentProjectCardTypes = useProjectCardTypes();
  const currentProjectDirectAndReferencedCardType = React.useMemo(
    () =>
      currentProjectCardTypes.flatMap(pct => {
        return pct.cardTypeId ? [pct.cardTypeId] : [];
      }),
    [currentProjectCardTypes],
  );

  if (statusPublished === 'NOT_INITIALIZED') {
    dispatch(API.getAvailablePublishedCardTypes());
  }

  if (currentProject && statusCurrentProject === 'NOT_INITIALIZED') {
    dispatch(API.getProjectCardTypes(currentProject));
  }

  if (statusPublished === 'READY' && statusCurrentProject === 'READY') {
    return {
      cardTypes: allPublishedCardTypes.filter(
        ct => ct.cardTypeId && !currentProjectDirectAndReferencedCardType.includes(ct.cardTypeId),
      ),
      status: 'READY',
    };
  } else if (statusCurrentProject !== 'READY') {
    return { cardTypes: [], status: statusCurrentProject };
  } else {
    return { cardTypes: [], status: statusPublished };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// All global card types (i.e. concrete CardType, no project)
////////////////////////////////////////////////////////////////////////////////////////////////////

function useGlobalTypesForAdmin(): CardTypeAllInOne[] {
  return useAppSelector(state => {
    return Object.values(state.cardType.cardtypes).flatMap(ct => {
      return entityIs(ct, 'CardType') && ct.projectId == null ? [makeCardTypeOnOneSOwn(ct)] : [];
    });
  }, customColabStateEquals);
}

export function useAndLoadGlobalTypesForAdmin(): {
  cardTypes: CardTypeAllInOne[];
  status: AvailabilityStatus;
} {
  const dispatch = useAppDispatch();

  const status = useAppSelector(state => state.cardType.allGlobalForAdminStatus);
  const cardTypes = useGlobalTypesForAdmin();
  // useAndLoadAllTextOfDocument(cardTypes);

  // TODO see how we can pre load all purposes

  if (status === 'NOT_INITIALIZED') {
    dispatch(API.getAllGlobalCardTypes());
  }

  if (status === 'READY') {
    return { cardTypes, status };
  } else {
    return { cardTypes: [], status };
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// card type tags
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Find list of all known tags
 */
// TODO see if useful or if can be discarded
export function useCardTypeTags() {
  return useAppSelector(state => {
    return uniq(
      Object.values(state.cardType.cardtypes).flatMap(ct => {
        if (entityIs(ct, 'CardType')) {
          return ct.tags;
        } else {
          return [];
        }
      }),
    ).sort();
  });
}

export function useCurrentProjectCardTypeTags(): string[] {
  const currentProjectCardTypes = useProjectCardTypes();

  return uniq(currentProjectCardTypes.flatMap(ct => ct.tags).sort());
}

export function useGlobalCardTypeTags(): string[] {
  const globalCardTypes = useGlobalTypesForAdmin();

  return uniq(globalCardTypes.flatMap(ct => ct.tags).sort());
}
