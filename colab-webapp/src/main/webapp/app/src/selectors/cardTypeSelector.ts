/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {useAppSelector} from '../store/hooks';
import {CardType, CardTypeRef, entityIs} from 'colab-rest-client';
import {ColabState} from '../store/store';

export interface CardTypeState {
  /**
   * UNSET means there is not guarantee all items are known.
   * User may want to refresh cardTypes.
   * READY means all cardtypes are known.
   * LOADING indicates cardtypes loading is in progress
   */
  status: 'UNSET' | 'LOADING' | 'READY';
  /**
   * the cardType; undefined means does not exists if status is READY
   */
  cardType: CardType | undefined;
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
  status: 'UNSET' | 'LOADING' | 'READY';
  /**
   * Own cardtypes are editable
   */
  projectCardType: CardType[];
  /**
   * Inherited card def are readonly
   */
  inheritedCardType: CardType[];
}

function resolveRef(state: ColabState, ref: CardTypeRef): CardTypeState {
  const result: CardTypeState = {
    status: 'READY',
    chain: [],
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
      if (s != null) {
        if (entityIs(s, 'CardType')) {
          return {
            status: 'READY',
            cardType: s,
            chain: [],
          };
        } else {
          return resolveRef(state, s);
        }
      }
    }

    return {
      status: state.cardtype.status,
      cardType: undefined,
      chain: [],
    };
  });
};

export const useCardTypes = (): CardTypesState => {
  return useAppSelector(state => {
    const cds: CardTypesState = {
      status: state.cardtype.status,
      projectCardType: [],
      inheritedCardType: [],
    };

    const currentProjectId = state.projects.editing;

    Object.values(state.cardtype.cardtypes).forEach(cd => {
      if (cd != null) {
        if (currentProjectId != null && cd.projectId === currentProjectId) {
          if (entityIs(cd, 'CardTypeRef')) {
            const resolved = resolveRef(state, cd);
            if (resolved.cardType != null) {
              cds.inheritedCardType.push(resolved.cardType);
            }
          } else {
            cds.projectCardType.push(cd);
          }
        }
      }
    });

    return cds;
  });
};
