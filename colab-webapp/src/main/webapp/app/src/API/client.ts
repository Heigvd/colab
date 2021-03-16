/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { ColabClient } from 'colab-rest-client';

import { getStore, ACTIONS } from '../store';

export const restClient = ColabClient('', error => {
  if (error instanceof Object && '@class' in error) {
    getStore().dispatch(ACTIONS.addError(error));
  } else {
  }
});
