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
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import logger from '../../logger';
import { useAppDispatch } from '../../store/hooks';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { space_lg } from '../../styling/style';
import PublicEntranceContainer from '../authentication/PublicEntranceContainer';
import SignInForm from '../authentication/SignIn';
import Button from '../common/element/Button';
import Flex from '../common/layout/Flex';
import Loading from '../common/layout/Loading';
import { prettyPrint } from '../common/toplevel/Notifier';

type StateType = 'LOADING' | 'AUTH_REQUIRED' | 'NO_TOKEN' | 'ERROR' | 'DONE';

interface TokenProps {
  tokenId: string | undefined;
  plainToken: string | undefined;
}

/**
 * When a user follows a link from a mail co.LAB sent
 */
export default function Token({ tokenId, plainToken }: TokenProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useCurrentUser();

  const [state, setState] = React.useState<StateType>('LOADING');
  const [redirectTo, setRedirectTo] = React.useState('');

  const [error, setError] = React.useState<Error | WithJsonDiscriminator | string | null>(null);

  const [infoMessages, setInfoMessages] = React.useState<string[] | undefined>();

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
    if (tokenId && plainToken) {
      // hack: nest API calls within this hook to avoid setting full token slice
      if (user.status === 'NOT_INITIALIZED') {
        // authenticate state not initialized -> reload
        dispatch(API.reloadCurrentUser());
        logger.debug('reload current user');
      } else if (user.status !== 'LOADING') {
        const loadToken = async () => {
          logger.debug('load token #', tokenId);
          try {
            const token = await API.getRestClient().TokenRestEndpoint.getToken(
              +tokenId,
              getTokenErrorHandler,
            );
            if (token != null) {
              logger.debug('Got token', token);
              setRedirectTo(token.redirectTo || '');
              if (user.currentUser === null && token.authenticationRequired) {
                logger.debug('Token requires authentication, current user is not');
                setState('AUTH_REQUIRED');
                if (entityIs(token, 'InvitationToken')) {
                  setInfoMessages([
                    i18n.authentication.info.projectInvitationCoLab.part1,
                    i18n.authentication.info.projectInvitationCoLab.part2,
                  ]);
                } else if (
                  entityIs(token, 'ModelSharingToken') ||
                  entityIs(token, 'SharingLinkToken')
                ) {
                  setInfoMessages([
                    i18n.authentication.info.otherInvitationCoLab.part1,
                    i18n.authentication.info.otherInvitationCoLab.part2,
                  ]);
                }
              } else {
                logger.debug('Ready to process the token');
                setError(null);

                const processedToken = await API.getRestClient().TokenRestEndpoint.consumeToken(
                  +tokenId,
                  plainToken,
                  defaultErrorHandler,
                );
                // some token may change authentication status: force to reload current user/account
                dispatch(API.reloadCurrentUser()).then(() => {
                  setRedirectTo(processedToken.redirectTo || '');
                });

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
  }, [dispatch, user, tokenId, plainToken]);

  const errorMessage = React.useMemo(() => {
    if (error) {
      return prettyPrint(error, i18n);
    } else {
      return null;
    }
  }, [error, i18n]);

  if (state === 'LOADING') {
    return <Loading />;
  }

  if (state === 'DONE') {
    return <Navigate to={redirectTo} />;
  }

  if (state === 'AUTH_REQUIRED') {
    const backToTokenUrl = location.pathname;

    return (
      <SignInForm
        redirectTo={backToTokenUrl}
        messages={infoMessages}
        forceShowCreateAccountButton
      />
    );
  }

  if (state === 'NO_TOKEN') {
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
  }

  // state === 'ERROR'
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
