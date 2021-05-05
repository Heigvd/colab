/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useAppSelector } from '../store/hooks';
import { CardDef } from 'colab-rest-client';

export interface CardDefState {
  /**
   * UNSET means there is not guarantee all items are known.
   * User may want to refresh cardDefs.
   * SET means all carddefs are known.
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

export const useCardDefs = (): CardDefState => {
  return useAppSelector(state => {
    const cds: CardDefState = {
      status: state.carddef.status,
      projectCardDef: [],
      inheritedCardDef: [],
    };

    const currentProjectId = state.projects.editing;

    Object.values(state.carddef.carddefs).forEach(cd => {
      if (cd != null) {
        if (currentProjectId != null && cd.projectId === currentProjectId) {
          cds.projectCardDef.push(cd);
        } else {
          cds.inheritedCardDef.push(cd);
        }
      }
    });

    return cds;
  });
};
