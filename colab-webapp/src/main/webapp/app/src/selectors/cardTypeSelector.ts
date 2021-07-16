/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CardType, CardTypeRef, entityIs } from 'colab-rest-client';
import { customColabStateEquals, useAppSelector } from '../store/hooks';
import { ColabState } from '../store/store';

export interface CardTypeState {
  /**
   * UNSET means there is not guarantee all items are known.
   * User may want to refresh cardTypes.
   * READY means all cardtypes are known.
   * LOADING indicates cardtypes loading is in progress
   */
  projectStatus: 'UNSET' | 'LOADING' | 'READY';
  publishedStatus: 'UNSET' | 'LOADING' | 'READY';
  globalStatus: 'UNSET' | 'LOADING' | 'READY';
  /**
   * the cardType; undefined means does not exists if status is READY
   */
  cardType: CardType | null | undefined;
  /**
   * references chain; first is the deepest
   */
  chain: CardTypeRef[];
}

export interface CardTypesState {
  /**
   * UNSET means there is not guarantee all items are known.
   * User may want to refresh cardTypes.
   * READY means all cardtypes are known.
   * LOADING indicates cardtypes loading is in progress
   */
  projectStatus: 'UNSET' | 'LOADING' | 'READY';
  publishedStatus: 'UNSET' | 'LOADING' | 'READY';
  globalStatus: 'UNSET' | 'LOADING' | 'READY';
  /**
   * Own cardtypes are editable
   */
  own: CardType[];
  /**
   * Inherited card type are readonly
   */
  inherited: CardType[];
  published: CardType[];
  global: CardType[];
}

function resolveRef(state: ColabState, ref: CardTypeRef): CardTypeState {
  const result: CardTypeState = {
    projectStatus: state.cardtype.currentProjectStatus,
    publishedStatus: state.cardtype.publishedStatus,
    globalStatus: state.cardtype.globalStatus,
    chain: [ref],
    cardType: undefined,
  };

  let current = ref;

  while (current != null) {
    if (current.abstractCardTypeId != null && current.abstractCardTypeId >= 0) {
      const target = state.cardtype.cardtypes[current.abstractCardTypeId];
      if (entityIs(target, 'CardType')) {
        result.cardType = target;
        return result;
      } else if (entityIs(target, 'CardTypeRef')) {
        result.chain.push(target);
        current = target;
      } else {
        result.cardType = target;
        return result;
      }
    } else {
      return result;
    }
  }
  return result;
}

export const useCardType = (id: number | null | undefined): CardTypeState => {
  return useAppSelector(state => {
    if (id != null) {
      const s = state.cardtype.cardtypes[id];
      if (s == null || entityIs(s, 'CardType')) {
        return {
          projectStatus: state.cardtype.currentProjectStatus,
          publishedStatus: state.cardtype.publishedStatus,
          globalStatus: state.cardtype.globalStatus,
          cardType: s,
          chain: [],
        };
      } else {
        return resolveRef(state, s);
      }
    }

    return {
      projectStatus: state.cardtype.currentProjectStatus,
      publishedStatus: state.cardtype.publishedStatus,
      globalStatus: state.cardtype.globalStatus,
      cardType: undefined,
      chain: [],
    };
  }, customColabStateEquals);
};

export const useProjectCardTypes = (): CardTypesState => {
  return useAppSelector(state => {
    const cds: CardTypesState = {
      projectStatus: state.cardtype.currentProjectStatus,
      publishedStatus: state.cardtype.publishedStatus,
      globalStatus: state.cardtype.globalStatus,
      // own card types
      own: [],
      inherited: [],
      published: [],
      global: [],
    };

    const currentProjectId = state.projects.editing;

    const processed: CardType[] = [];

    if (currentProjectId) {
      // first pass: extract own and inherited types
      Object.values(state.cardtype.cardtypes).forEach(cd => {
        if (cd != null) {
          if (cd.projectId === currentProjectId) {
            if (entityIs(cd, 'CardTypeRef')) {
              const resolved = resolveRef(state, cd);
              if (resolved.cardType != null) {
                processed.push(resolved.cardType);
                cds.inherited.push(resolved.cardType);
              }
            } else {
              processed.push(cd);
              cds.own.push(cd);
            }
          }
        }
      });

      // second pass: not-yet-used published types
      Object.values(state.cardtype.cardtypes).forEach(cd => {
        if (cd != null) {
          const t = entityIs(cd, 'CardType') ? cd : resolveRef(state, cd).cardType;
          if (t != null && processed.indexOf(t) === -1 && cd.published) {
            if (cd.projectId == null) {
              cds.global.push(t);
            } else {
              cds.published.push(t);
            }
          }
        }
      });
    }

    return cds;
  }, customColabStateEquals);
};

export const useGlobalTypes = (): {
  status: 'READY' | 'LOADING' | 'UNSET';
  types: CardType[];
} => {
  return useAppSelector(state => {
    return {
      status: state.cardtype.globalStatus,
      types: Object.values(state.cardtype.cardtypes).flatMap(cd => {
        return entityIs(cd, 'CardType') && cd.projectId == null ? [cd] : [];
      }),
    };
  }, customColabStateEquals);
};
