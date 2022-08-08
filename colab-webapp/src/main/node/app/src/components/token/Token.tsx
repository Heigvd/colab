/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { getRestClient, reloadCurrentUser } from '../../API/api';
import logger from '../../logger';
import { useCurrentUser } from '../../selectors/userSelector';
import { useAppDispatch } from '../../store/hooks';
import SignInForm from '../authentication/SignIn';
import Loading from '../common/layout/Loading';
import Overlay from '../common/layout/Overlay';

interface TokenProps {
  tokenId: string | undefined;
  token: string | undefined;
}

type STATE_TYPE = 'LOADING' | 'AUTH_REQUIRED' | 'NO_TOKEN' | 'ERROR' | 'DONE' | 'UNCOMPLETE_URL';

// When user follows link in invitation mail.
export default function Token(props: TokenProps): JSX.Element {
  const user = useCurrentUser();
  const dispatch = useAppDispatch();

  const location = useLocation();

  // WARNING REPLACE AUTH REQUIRED BY LOADING. AFTER TEST FINISHED
  const [state, setState] = React.useState<STATE_TYPE>('LOADING');
  const [redirectTo, setRedirectTo] = React.useState('');

  React.useEffect(() => {
    if (props.tokenId && props.token) {
      const tokenId = props.tokenId;
      const tokenHash = props.token;
      // hack: nest API calls within this hook to avoid setting full token slice
      if (user.status === 'NOT_INITIALIZED') {
        // authenticate state not initialized -> reload
        dispatch(reloadCurrentUser());
        logger.debug('reload current user');
      } else if (user.status !== 'LOADING') {
        // null user means unauthenticated
        const loadToken = async () => {
          logger.debug('load token #', tokenId);
          const token = await getRestClient().TokenRestEndpoint.getToken(+tokenId);
          if (token != null) {
            logger.debug('Got token', token);
            setRedirectTo(token.redirectTo || '');
            if (user.currentUser === null && token.authenticationRequired) {
              logger.debug('Token requires authentication, current user is not');
              setState('AUTH_REQUIRED');
            } else {
              logger.debug('Ready to process the token');
              try {
                const processedToken = await getRestClient().TokenRestEndpoint.consumeToken(
                  +tokenId,
                  tokenHash,
                );
                setRedirectTo(processedToken.redirectTo || '');
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
    } else {
      setState('UNCOMPLETE_URL');
    }
  }, [dispatch, user, props.tokenId, props.token]);

  if (state === 'LOADING') {
    return <Loading />;
  } else if (state === 'DONE') {
    return <Navigate to={redirectTo} />;
  } else if (state === 'AUTH_REQUIRED') {
    const backToTokenUrl = location.pathname;
    return (
      <Overlay>
        <SignInForm
          redirectTo={backToTokenUrl}
          message={
            "Hi! You have been invited to collaborate on a project in co.LAB. Sign in or create your very own account. Happy colabbin'!"
          }
        />
        {/* <Flex direction="column" className={cx(cardStyle, paddedContainerStyle)}>
          <h2>Authentication required</h2>
          Do you already have a colab account?
          <InlineLink to={buildLinkWithQueryParam('/SignIn', { redirectTo: backToTokenUrl })}>
            Sign in
          </InlineLink>
          <span>  </span>
          <InlineLink to={buildLinkWithQueryParam('/SignUp', { redirectTo: backToTokenUrl })}>
            sign up
          </InlineLink>
          <span>.</span>
        </Flex> */}
      </Overlay>
    );
  } else if (state === 'NO_TOKEN') {
    return (
      <Overlay>
        <div>
          <b>Oops! The link you got is uncomplete.</b>
        </div>
        <Link to={'../'}>Back to colab home</Link>
      </Overlay>
    );
  } else {
    return (
      <Overlay>
        {state === 'UNCOMPLETE_URL' ? (
          <div>
            {/* Error while processing token. Please try to refresh or contact the admin of your colab
          project. */}
            <b>Oops! The link you got is uncomplete.</b>
            <p>Please check again your mail or contact the person who sent you the invitation.</p>
            <Link to={'../'} className={css({ display: 'block' })}>
              Back to colab home
            </Link>
          </div>
        ) : (
          <div>
            <b> Oops! There was an error. </b>
            <p>
              Invalid or deprecated link. Please try to refresh. If not working, maybe your
              invitation has been deleted by the host.
            </p>
            <Link to={'../'} className={css({ display: 'block' })}>
              Back to colab home
            </Link>
          </div>
        )}
      </Overlay>
    );
  }
}
