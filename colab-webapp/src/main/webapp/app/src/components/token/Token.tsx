/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Loading from '../common/Loading';
import { getRestClient, reloadCurrentUser } from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { Redirect, useLocation } from 'react-router-dom';
import { InlineLink } from '../common/Link';
import { buildLinkWithQueryParam } from '../../helper';
import Overlay from '../common/Overlay';
import { useCurrentUser } from '../../selectors/userSelector';

interface TokenProps {
  tokenId: string;
  token: string;
}

type STATE_TYPE = 'LOADING' | 'AUTH_REQUIRED' | 'NO_TOKEN' | 'ERROR' | 'DONE';

export default (props: TokenProps): JSX.Element => {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();

  const location = useLocation();

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
        const token = await getRestClient().TokenRestEndpoint.getToken(+props.tokenId);
        if (token != null) {
          setRedirectTo(token.redirectTo || '');
          if (user === null && token.authenticationRequired) {
            setState('AUTH_REQUIRED');
          } else {
            try {
              await getRestClient().TokenRestEndpoint.consumeToken(+props.tokenId, props.token);
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
  }, [dispatch, user, props.tokenId, props.token]);

  if (state == 'LOADING') {
    return <Loading />;
  } else if (state == 'DONE') {
    return <Redirect to={redirectTo} />;
  } else if (state == 'AUTH_REQUIRED') {
    const backToTokenUrl = location.pathname;
    return (
      <Overlay>
        <div>
          <span>Authentication required: please </span>
          <InlineLink to={buildLinkWithQueryParam('/SignIn', { redirectTo: backToTokenUrl })}>
            sign in
          </InlineLink>
          <span> or </span>
          <InlineLink to={buildLinkWithQueryParam('/SignUp', { redirectTo: backToTokenUrl })}>
            sign up
          </InlineLink>
          <span>.</span>
        </div>
      </Overlay>
    );
  } else if (state == 'NO_TOKEN') {
    return (
      <Overlay>
        <div>Token does not exists</div>
      </Overlay>
    );
  } else {
    return (
      <Overlay>
        <div> Error while processing token </div>;
      </Overlay>
    );
  }
};
