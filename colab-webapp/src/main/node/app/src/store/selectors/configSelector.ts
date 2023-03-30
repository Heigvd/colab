/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { VersionDetails } from 'colab-rest-client';
import { getConfig, getVersionDetails } from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../hooks';
import { LoadingStatus } from '../store';

interface CConfig {
  showCreateAccountButton: boolean;
  status: LoadingStatus;
}

export const useColabConfig = (): CConfig => {
  const dispatch = useAppDispatch();
  return useAppSelector(state => {
    if (state.config.configState === 'NOT_INITIALIZED') {
      dispatch(getConfig());
      return {
        status: 'LOADING',
        showCreateAccountButton: false,
      };
    }

    return {
      status: state.config.configState,
      showCreateAccountButton: state.config.config.displayCreateLocalAccountButton,
      yjsUrl: state.config.config.yjsApiEndpoint,
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
