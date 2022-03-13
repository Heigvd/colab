/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CardType as CardTypeOnly, CardTypeRef, entityIs } from 'colab-rest-client';
import { uniq } from 'lodash';
import * as API from '../API/api';
import { customColabStateEquals, useAppDispatch, useAppSelector } from '../store/hooks';
import { AvailabilityStatus, ColabState } from '../store/store';
import { CardTypeAllInOne, CardTypeAndStatus } from '../types/cardTypeDefinition';
import { useProjectBeingEdited } from './projectSelector';

// TODO sandra work in progress, check that 'import.*CardType.*colab-rest' is not used in components

/* 
Besoin d'un hook qui retourne tous les modèles de cartes du projet en cours:
ProjectCardTypes = cardType[]
cardType = {
deprecated: boolean
id: number
projectId: number
published: boolean 
trackingData?: Trackinig 
purpose?: string
tags: string[]
title: string
? nbOfResources: number
? usedBy: Card[] (ou un hook IsUsedBy() qui retournerait un tableau de cartes utilisant ce modèle)
?(new: tagType: 'global' | 'inherited' | 'own' ?)
}
Besoin d'un hook qui retourne tous les modèles de cartes inutilisés dans le projet: (même structure)
 */

////////////////////////////////////////////////////////////////////////////////////////////////////
// useful stuff to make a convenient card type for the client side
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Turn a card type from a server side model into a convenient model for the client side
 *
 * @param cardType the card type, as seen by the server side (it is on it's one, no reference)
 *
 * @returns the card type, as conveninent for the client side
 */
function makeCardTypeOnOneSOwn(cardType: CardTypeOnly): CardTypeAllInOne {
  return {
    kind: 'own',

    ownId: cardType.id,
    cardTypeId: cardType.id,

    deprecated: cardType.deprecated,

    published: cardType.published,

    title: cardType.title,
    purposeId: cardType.purposeId,
    tags: cardType.tags,

    trackingDataCT: cardType.trackingData,

    projectIdCT: cardType.projectId,
  };
}

/**
 * Turn a card type with a reference from a server side model
 * into a convenient model for the client side
 *
 * @param ref      the starting reference as seen by the server side
 * @param refChain the references chain from the start reference to the concrete card type
 * @param cardType the targeted concrete card type as seen by the server side
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

    projectIdCTRef: ref.projectId,
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
  // TODO sandra work in progress see if useful or not
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
 * @returns the targeted card type + references + the availability status
 */
function expandRef(state: ColabState, ref: CardTypeRef): ExpandedCardType | AvailabilityStatus {
  const refChain = [ref];

  let current: CardTypeRef = ref;

  while (current) {
    if (current.targetId) {
      const targetState = state.cardtype.cardtypes[current.targetId];

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
 * @returns the requested card type + references (if found) + the availability status
 */
const useCardType = (id: number | null | undefined): CardTypeAndStatus => {
  return useAppSelector(state => {
    if (id != null) {
      const directCardTypeOrRef = state.cardtype.cardtypes[id];

      if (entityIs(directCardTypeOrRef, 'CardType')) {
        // it is directly a card type
        return { cardType: makeCardTypeOnOneSOwn(directCardTypeOrRef), status: 'READY' };
      } else if (entityIs(directCardTypeOrRef, 'CardTypeRef')) {
        // it is a card type reference, retrieve the targeted card type
        const resolved = expandRef(state, directCardTypeOrRef);
        if (typeof resolved === 'string') {
          return { cardType: undefined, status: resolved };
        } else if (resolved.cardType) {
          return {
            cardType: makeCardTypeWithRef(resolved.ref, resolved.refChain, resolved.cardType),
            status: 'READY',
          };
        }
      } else if (typeof directCardTypeOrRef === 'string') {
        // it is an availability status, just transmit
        return { cardType: undefined, status: directCardTypeOrRef };
      } else {
        return { cardType: undefined, status: 'NOT_INITIALIZED' };
      }
    }

    // there was an error / the state is inconsistent
    return { cardType: undefined, status: 'ERROR' };
  }, customColabStateEquals);
};

/**
 * fetch (and load if needed) the card type + target card type + references
 *
 * @param id the id of the card type / reference we want
 * @returns the requested card type + references (if found) + the availability status
 */
export const useAndLoadCardType = (id: number | null | undefined): CardTypeAndStatus => {
  const dispatch = useAppDispatch();

  const { cardType, status } = useCardType(id);

  if (status === 'NOT_INITIALIZED' && id != null) {
    dispatch(API.getExpandedCardType(id));
  }

  return { cardType, status };
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////

const useProjectCardTypes2 = (): CardTypeAllInOne[] => {
  return useAppSelector(state => {
    const result: CardTypeAllInOne[] = [];

    const currentProjectId = state.projects.editing;

    if (currentProjectId) {
      Object.values(state.cardtype.cardtypes).forEach(act => {
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

    return result;
  }, customColabStateEquals);
};

export const useAndLoadProjectCardTypes = (): {
  cardTypes: CardTypeAllInOne[];
  status: AvailabilityStatus;
} => {
  const dispatch = useAppDispatch();

  const cardTypes = useProjectCardTypes2();
  const status = useAppSelector(state => state.cardtype.currentProjectStatus);
  const { project } = useProjectBeingEdited();

  if (status === 'NOT_INITIALIZED' && project) {
    dispatch(API.getProjectCardTypes(project));
  }

  if (status === 'READY') {
    return { cardTypes, status: status };
  } else {
    return { cardTypes: [], status: status };
  }
};

const usePublishedCardTypes = (): CardTypeAllInOne[] => {
  return useAppSelector(state => {
    return Object.values(state.cardtype.cardtypes).flatMap(ct => {
      return entityIs(ct, 'CardType') && ct.published ? [makeCardTypeOnOneSOwn(ct)] : [];
    });
  }, customColabStateEquals);
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO sandra work in progress - do not return the same as in project

export const useAndLoadAvailableCardTypes = (): {
  cardTypes: CardTypeAllInOne[];
  status: AvailabilityStatus;
} => {
  const dispatch = useAppDispatch();

  const { project: currentProject } = useProjectBeingEdited();

  const statusPublished = useAppSelector(state => state.cardtype.availablePublishedStatus);
  const statusCurrentProject = useAppSelector(state => state.cardtype.currentProjectStatus);

  const allPublishedCardTypes = usePublishedCardTypes();
  const projectCardTypes = useProjectCardTypes2();

  if (statusPublished === 'NOT_INITIALIZED') {
    dispatch(API.getAvailablePublishedCardTypes());
  }

  if (currentProject && statusCurrentProject === 'NOT_INITIALIZED') {
    dispatch(API.getProjectCardTypes(currentProject));
  }

  if (statusPublished === 'READY' && statusCurrentProject === 'READY') {
    return {
      cardTypes: allPublishedCardTypes.filter(ct => !projectCardTypes.includes(ct)),
      status: 'READY',
    };
  } else if (statusCurrentProject !== 'READY') {
    return { cardTypes: [], status: statusCurrentProject };
  } else {
    return { cardTypes: [], status: statusPublished };
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////

const useGlobalTypesForAdmin = (): CardTypeAllInOne[] => {
  return useAppSelector(state => {
    return Object.values(state.cardtype.cardtypes).flatMap(ct => {
      return entityIs(ct, 'CardType') && ct.projectId == null ? [makeCardTypeOnOneSOwn(ct)] : [];
    });
  }, customColabStateEquals);
};

export const useAndLoadGlobalTypesForAdmin = (): {
  cardTypes: CardTypeAllInOne[];
  status: AvailabilityStatus;
} => {
  const dispatch = useAppDispatch();

  const cardTypes = useGlobalTypesForAdmin();
  const status = useAppSelector(state => state.cardtype.allGlobalForAdminStatus);

  // TODO sandra work in progress see how we can pre load all purposes

  if (status === 'NOT_INITIALIZED') {
    dispatch(API.getAllGlobalCardTypes());
  }

  if (status === 'READY') {
    return { cardTypes, status: status };
  } else {
    return { cardTypes: [], status: status };
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Find list of all known tags
 */
export function useCardTypeTags() {
  return useAppSelector(state => {
    return uniq(
      Object.values(state.cardtype.cardtypes).flatMap(ct => {
        if (entityIs(ct, 'CardType')) {
          return ct.tags;
        } else {
          return [];
        }
      }),
    ).sort();
  });
}

////////////////////
// old stuff

// TODO sandra work in progress, remove everything that is not used any more

// export interface CardTypeState {
//   /**
//    * UNSET means there is not guarantee all items are known.
//    * User may want to refresh cardTypes.
//    * READY means all cardtypes are known.
//    * LOADING indicates cardtypes loading is in progress
//    */
//   projectStatus: AvailabilityStatus;
//   publishedStatus: AvailabilityStatus;
//   globalStatus: AvailabilityStatus;
//   /**
//    * the cardType; undefined means does not exists if status is READY
//    */
//   cardType: CardTypeOnly | null | undefined;
//   /**
//    * references chain; first is the deepest
//    */
//   chain: CardTypeRef[];
// }

// export interface CardTypesState {
//   /**
//    * UNSET means there is not guarantee all items are known.
//    * User may want to refresh cardTypes.
//    * READY means all cardtypes are known.
//    * LOADING indicates cardtypes loading is in progress
//    */
//   projectStatus: AvailabilityStatus;
//   publishedStatus: AvailabilityStatus;
//   globalStatus: AvailabilityStatus;
//   /**
//    * Card types defined specifically for this project.
//    * Own cardtypes are editable
//    */
//   own: CardTypeOnly[];
//   /**
//    * Card types of outside referenced in the project.
//    * Inherited card type are readonly
//    */
//   inherited: CardTypeOnly[];
//   /**
//    * Published card types defined in another project. Not (yet) used in the project.
//    */
//   published: CardTypeOnly[];
//   /**
//    * Global (without project) published card types. Not (yet) used in the project.
//    */
//   global: CardTypeOnly[];
// }

// function resolveRef(state: ColabState, ref: CardTypeRef): CardTypeState {
//   const result: CardTypeState = {
//     projectStatus: state.cardtype.currentProjectStatus,
//     publishedStatus: state.cardtype.availablePublishedStatus,
//     globalStatus: state.cardtype.allGlobalForAdminStatus,
//     chain: [ref],
//     cardType: undefined,
//   };

//   let current = ref;

//   while (current != null) {
//     if (current.targetId != null && current.targetId >= 0) {
//       const target = state.cardtype.cardtypes[current.targetId];
//       if (entityIs(target, 'CardType')) {
//         result.cardType = target;
//         return result;
//       } else if (entityIs(target, 'CardTypeRef')) {
//         result.chain.push(target);
//         current = target;
//       } else if (typeof target !== 'string') {
//         result.cardType = target;
//         return result;
//       }
//     } else {
//       return result;
//     }
//   }
//   return result;
// }

// export const useProjectCardTypes = (): CardTypesState => {
//   return useAppSelector(state => {
//     const cds: CardTypesState = {
//       projectStatus: state.cardtype.currentProjectStatus,
//       publishedStatus: state.cardtype.availablePublishedStatus,
//       globalStatus: state.cardtype.allGlobalForAdminStatus,
//       // own card types
//       own: [],
//       inherited: [],
//       published: [],
//       global: [],
//     };

//     const currentProjectId = state.projects.editing;

//     const processed: CardTypeOnly[] = [];

//     if (currentProjectId) {
//       // first pass: extract own and inherited types
//       Object.values(state.cardtype.cardtypes).forEach(cd => {
//         if (cd != null && entityIs(cd, 'AbstractCardType')) {
//           if (cd.projectId === currentProjectId) {
//             if (entityIs(cd, 'CardTypeRef')) {
//               const resolved = resolveRef(state, cd);
//               if (resolved.cardType != null) {
//                 processed.push(resolved.cardType);
//                 cds.inherited.push(resolved.cardType);
//               }
//             } else {
//               processed.push(cd);
//               cds.own.push(cd);
//             }
//           }
//         }
//       });

//       // second pass: not-yet-used published types
//       Object.values(state.cardtype.cardtypes).forEach(cd => {
//         if (cd != null && entityIs(cd, 'AbstractCardType')) {
//           const t = entityIs(cd, 'CardType') ? cd : resolveRef(state, cd).cardType;
//           if (t != null && processed.indexOf(t) === -1 && cd.published) {
//             if (cd.projectId == null) {
//               cds.global.push(t);
//             } else {
//               cds.published.push(t);
//             }
//           }
//         }
//       });
//     }

//     return cds;
//   }, customColabStateEquals);
// };

// export const useGlobalTypes = (): {
//   status: AvailabilityStatus;
//   types: CardTypeOnly[];
// } => {
//   return useAppSelector(state => {
//     return {
//       status: state.cardtype.allGlobalForAdminStatus,
//       types: Object.values(state.cardtype.cardtypes).flatMap(cd => {
//         return entityIs(cd, 'CardType') && cd.projectId == null ? [cd] : [];
//       }),
//     };
//   }, customColabStateEquals);
// };
