/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { getRestClient, reloadCurrentUser } from '../../API/api';
import { buildLinkWithQueryParam } from '../../helper';
import { logger } from '../../logger';
import { useCurrentUser } from '../../selectors/userSelector';
import { useAppDispatch } from '../../store/hooks';
import { InlineLink } from '../common/Link';
import Loading from '../common/Loading';
import Overlay from '../common/Overlay';

interface TokenProps {
  tokenId: string;
  token: string;
}

type STATE_TYPE = 'LOADING' | 'AUTH_REQUIRED' | 'NO_TOKEN' | 'ERROR' | 'DONE';

export default (props: TokenProps): JSX.Element => {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();

  const location = useLocation();

  const [state, setState] = React.useState<STATE_TYPE>('LOADING');
  const [redirectTo, setRedirectTo] = React.useState('');

  React.useEffect(() => {
    // hack: nest API calls within this hook to avoid setting full token slice
    if (user.status === 'UNKNOWN') {
      // authenticate state not known-> reload
      dispatch(reloadCurrentUser());
      logger.debug('reload current user');
    } else if (user.status !== 'LOADING') {
      // null user means unauthenticated
      const loadToken = async () => {
        logger.debug('load token #', props.tokenId);
        const token = await getRestClient().TokenRestEndpoint.getToken(+props.tokenId);
        if (token != null) {
          logger.debug('Got token', token);
          setRedirectTo(token.redirectTo || '');
          if (user.currentUser === null && token.authenticationRequired) {
            logger.debug('Token requires authentication, current user is not');
            setState('AUTH_REQUIRED');
          } else {
            logger.debug('Ready to process the token');
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
          logger.debug('Got no token...');
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
        <div>Token does not exist</div>
      </Overlay>
    );
  } else {
    return (
      <Overlay>
        <div>Error while processing token</div>;
      </Overlay>
    );
  }
};
