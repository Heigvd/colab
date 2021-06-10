/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Document } from 'colab-rest-client';
import { useAppSelector } from '../store/hooks';

export const useDocument = (id: number): Document | 'LOADING' | undefined => {
  return useAppSelector(state => {
    if (id != null) {
      const docDetail = state.document.documents[id];

      if (docDetail === null) {
        return 'LOADING';
      } else {
        return docDetail;
      }
    }
    return undefined;
  }); // refEqual is fine
};
