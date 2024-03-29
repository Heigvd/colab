/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { VersionDetails } from 'colab-rest-client';
import * as API from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../hooks';
import { LoadingStatus } from '../store';

interface CConfig {
  showCreateAccountButton: boolean;
  status: LoadingStatus;
  yjsUrl: string | undefined;
  fileSizeLimit: number;
}

export const useColabConfig = (): CConfig => {
  const dispatch = useAppDispatch();
  return useAppSelector(state => {
    if (state.config.configState === 'NOT_INITIALIZED') {
      dispatch(API.getConfig());
      return {
        status: 'LOADING',
        showCreateAccountButton: false,
        yjsUrl: undefined,
        fileSizeLimit: 0,
      };
    }

    return {
      status: state.config.configState,
      showCreateAccountButton: state.config.config.displayCreateLocalAccountButton,
      yjsUrl: state.config.config.yjsApiEndpoint,
      fileSizeLimit: state.config.config.jcrRepositoryFileSizeLimit,
    };
  }, shallowEqual);
};

export const useVersionDetails = (): VersionDetails | 'LOADING' => {
  const dispatch = useAppDispatch();
  return useAppSelector(state => {
    if (state.admin.versionStatus === 'NOT_INITIALIZED') {
      dispatch(API.getVersionDetails());
      return 'LOADING';
    } else {
      return state.admin.version;
    }
  }, shallowEqual);
};

export const useTermsOfUseTime = (): number | 'LOADING' => {
  const dispatch = useAppDispatch();
  return useAppSelector(state => {
    if (state.security.securityState === 'NOT_INITIALIZED') {
      dispatch(API.getTermsOfUseTime());
      return 'LOADING';
    } else {
      return state.security.termsOfUseAndDataPolicyTime;
    }
  });
};
