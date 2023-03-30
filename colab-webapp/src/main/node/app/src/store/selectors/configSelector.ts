/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { VersionDetails } from 'colab-rest-client';
import { getAccountConfig, getVersionDetails } from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../hooks';
import { LoadingStatus } from '../store';

interface AConfig {
  showCreateAccountButton: boolean;
  status: LoadingStatus;
}

export const useAccountConfig = (): AConfig => {
  const dispatch = useAppDispatch();
  return useAppSelector(state => {
    if (state.config.accountConfigState === 'NOT_INITIALIZED') {
      dispatch(getAccountConfig());
      return {
        status: 'LOADING',
        showCreateAccountButton: false,
      };
    }

    return {
      status: state.config.accountConfigState,
      showCreateAccountButton: state.config.accountConfig.displayCreateLocalAccountButton,
    };
  }, shallowEqual);
};

export const useVersionDetails = (): VersionDetails | 'LOADING' => {
  const dispatch = useAppDispatch();
  return useAppSelector(state => {
    if (state.admin.versionStatus === 'NOT_INITIALIZED') {
      dispatch(getVersionDetails());
      return 'LOADING';
    } else {
      return state.admin.version;
    }
  }, shallowEqual);
};
