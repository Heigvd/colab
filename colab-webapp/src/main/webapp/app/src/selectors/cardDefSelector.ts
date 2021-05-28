/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useAppSelector } from '../store/hooks';
import { CardDef, CardDefRef, entityIs } from 'colab-rest-client';
import { ColabState } from '../store/store';

export interface CardDefState {
  /**
   * UNSET means there is not guarantee all items are known.
   * User may want to refresh cardDefs.
   * READY means all carddefs are known.
   * LOADING indicates carddefs loading is in progress
   */
  status: 'UNSET' | 'LOADING' | 'READY';
  /**
   * the cardDef; undefined means does not exists if status is READY
   */
  cardDef: CardDef | undefined;
  /**
   * references chain; first is the deepest
   */
  chain: CardDefRef[];
}

export interface CardDefsState {
  /**
   * UNSET means there is not guarantee all items are known.
   * User may want to refresh cardDefs.
   * READY means all carddefs are known.
   * LOADING indicates carddefs loading is in progress
   */
  status: 'UNSET' | 'LOADING' | 'READY';
  /**
   * Own carddefs are editable
   */
  projectCardDef: CardDef[];
  /**
   * Inherited card def are readonly
   */
  inheritedCardDef: CardDef[];
}

function resolveRef(state: ColabState, ref: CardDefRef): CardDefState {
  const result: CardDefState = {
    status: 'READY',
    chain: [],
    cardDef: undefined,
  };

  let current = ref;

  while (current != null) {
    if (current.abstractCardDefId != null && current.abstractCardDefId >= 0) {
      const target = state.carddef.carddefs[current.abstractCardDefId];
      if (entityIs(target, 'CardDef')) {
        result.cardDef = target;
        return result;
      } else if (entityIs(target, 'CardDefRef')) {
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

export const useCardDef = (id: number | null | undefined): CardDefState => {
  return useAppSelector(state => {
    if (id != null) {
      const s = state.carddef.carddefs[id];
      if (s != null) {
        if (entityIs(s, 'CardDef')) {
          return {
            status: 'READY',
            cardDef: s,
            chain: [],
          };
        } else {
          return resolveRef(state, s);
        }
      }
    }

    return {
      status: state.carddef.status,
      cardDef: undefined,
      chain: [],
    };
  });
};

export const useCardDefs = (): CardDefsState => {
  return useAppSelector(state => {
    const cds: CardDefsState = {
      status: state.carddef.status,
      projectCardDef: [],
      inheritedCardDef: [],
    };

    const currentProjectId = state.projects.editing;

    Object.values(state.carddef.carddefs).forEach(cd => {
      if (cd != null) {
        if (currentProjectId != null && cd.projectId === currentProjectId) {
          if (entityIs(cd, 'CardDefRef')) {
            const resolved = resolveRef(state, cd);
            if (resolved.cardDef != null) {
              cds.inheritedCardDef.push(resolved.cardDef);
            }
          } else if (entityIs(cd, 'CardDefRef')) {
            cds.projectCardDef.push(cd);
          }
        }
      }
    });

    return cds;
  });
};
