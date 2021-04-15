/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Loading from '../common/Loading';
import { getRestClient, reloadCurrentUser } from '../../API/api';
import { useAppDispatch, useCurrentUser } from '../../store/hooks';
import { Redirect } from 'react-router-dom';

interface TokenProps {
  tokenId: string;
  token: string;
}

type STATE_TYPE = 'LOADING' | 'AUTH_REQUIRED' | 'NO_TOKEN' | 'ERROR' | 'DONE';

export default (props: TokenProps) => {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();

  if (user === undefined) {
    // authenticate state not known-> reload
    dispatch(reloadCurrentUser());
  }

  const [state, setState] = React.useState<STATE_TYPE>('LOADING');
  const [redirectTo, setRedirectTo] = React.useState('');

  React.useEffect(() => {
    // hack: nest API calls within this hook to avoid setting full token slice
    if (user !== undefined) {
      // null user means unauthenticated
      const loadToken = async () => {
        const token = await getRestClient().TokenController.getToken(+props.tokenId);
        if (token != null) {
          setRedirectTo(token.redirectTo || '');
          if (user === null && token.authenticationRequired) {
            setState('AUTH_REQUIRED');
          } else {
            try {
              await getRestClient().TokenController.consumeToken(+props.tokenId, props.token);
              // some token may change authentication status: force to reload current user/account
              dispatch(reloadCurrentUser());
              setState('DONE');
            } catch (e) {
              setState('ERROR');
            }
          }
        } else {
          // token not found
          setState('NO_TOKEN');
        }
      };
      loadToken();
    }
    return () => {
      //clean}
    };
  }, [user]);

  if (state == 'LOADING') {
    return <Loading />;
  } else if (state == 'DONE') {
    return <Redirect to={redirectTo} />;
  } else if (state == 'AUTH_REQUIRED') {
    // TODO ask user to sign in/up and, once authenticated, redirect back here
    return <div>Authentication required: please sign in or sign up</div>;
  } else if (state == 'NO_TOKEN') {
    return <div>Token does not exists</div>;
  } else {
    return <div> Error while processing token </div>;
  }
};
