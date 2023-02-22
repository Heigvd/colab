/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs, WithJsonDiscriminator } from 'colab-rest-client';
import * as React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getRestClient, reloadCurrentUser } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import logger from '../../logger';
import { useCurrentUser } from '../../selectors/userSelector';
import { useAppDispatch } from '../../store/hooks';
import PublicEntranceContainer from '../authentication/PublicEntranceContainer';
import SignInForm from '../authentication/SignIn';
import Button from '../common/element/Button';
import Flex from '../common/layout/Flex';
import Loading from '../common/layout/Loading';
import Overlay from '../common/layout/Overlay';
import { prettyPrint } from '../common/toplevel/Notifier';
import { space_lg } from '../styling/style';

interface TokenProps {
  tokenId: string | undefined;
  token: string | undefined;
}

type STATE_TYPE = 'LOADING' | 'AUTH_REQUIRED' | 'NO_TOKEN' | 'ERROR' | 'DONE';

/** when user follows a link from a mail co.LAB sent */
export default function Token(props: TokenProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();

  // WARNING REPLACE AUTH REQUIRED BY LOADING. AFTER TEST FINISHED
  const [state, setState] = React.useState<STATE_TYPE>('LOADING');
  const [redirectTo, setRedirectTo] = React.useState('');

  const [error, setError] = React.useState<Error | WithJsonDiscriminator | string | null>(null);

  function getTokenErrorHandler(error: WithJsonDiscriminator | Error) {
    if (error) {
      if (
        entityIs<'HttpErrorMessage'>(error, 'HttpErrorMessage') &&
        error.messageCode === 'ACCESS_DENIED'
      ) {
        setError(i18n.common.error.tryToLogOut);
      } else {
        setError(error);
      }
    }
  }

  function defaultErrorHandler(error: WithJsonDiscriminator | Error) {
    if (error) {
      setError(error);
    }
  }

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
        const loadToken = async () => {
          logger.debug('load token #', tokenId);
          try {
            const token = await getRestClient().TokenRestEndpoint.getToken(
              +tokenId,
              getTokenErrorHandler,
            );
            if (token != null) {
              logger.debug('Got token', token);
              setRedirectTo(token.redirectTo || '');
              if (user.currentUser === null && token.authenticationRequired) {
                logger.debug('Token requires authentication, current user is not');
                setState('AUTH_REQUIRED');
              } else {
                logger.debug('Ready to process the token');
                setError(null);

                const processedToken = await getRestClient().TokenRestEndpoint.consumeToken(
                  +tokenId,
                  tokenHash,
                  defaultErrorHandler,
                );
                setRedirectTo(processedToken.redirectTo || '');
                // some token may change authentication status: force to reload current user/account
                dispatch(reloadCurrentUser());
                setState('DONE');
              }
            } else {
              // token not found
              logger.debug('Got no token...');
              setState('NO_TOKEN');
            }
          } catch (e) {
            setState('ERROR');
          }
        };
        loadToken();
      }
      return () => {
        //clean}
      };
    } else {
      setState('NO_TOKEN');
    }
    // it seems that there is a problem with getTokenErrorHandler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, user, props.tokenId, props.token]);

  const errorMessage = React.useMemo(() => {
    if (error) {
      return prettyPrint(error, i18n);
    } else {
      return null;
    }
  }, [error, i18n]);

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
          message={i18n.authentication.info.invitationCoLab}
          forceShowCreateAccountButton
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
      <PublicEntranceContainer>
        <Flex direction="column">
          <h3>{i18n.authentication.error.invalidLink}</h3>
          <p>{i18n.authentication.error.pleaseRefresh}</p>
          <Button onClick={() => navigate('../')} className={css({ marginTop: space_lg })}>
            {i18n.common.action.backToHome}
          </Button>
        </Flex>
      </PublicEntranceContainer>
    );
  } else {
    return (
      <PublicEntranceContainer>
        <Flex direction="column">
          <h3>{i18n.common.error.sorryError}</h3>
          {errorMessage != null ? (
            <p>{errorMessage}</p>
          ) : (
            <p>{i18n.authentication.error.pleaseRefresh}</p>
          )}
          <Button onClick={() => navigate('../')} className={css({ marginTop: space_lg })}>
            {i18n.common.action.backToHome}
          </Button>
        </Flex>
      </PublicEntranceContainer>
    );
  }
}
