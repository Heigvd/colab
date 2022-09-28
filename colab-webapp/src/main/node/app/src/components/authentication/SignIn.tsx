/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WithJsonDiscriminator } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { buildLinkWithQueryParam } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAccountConfig } from '../../selectors/configSelector';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Form, { Field, PasswordScore } from '../common/element/Form';
import { InlineLink } from '../common/element/Link';
import Flex from '../common/layout/Flex';
import { prettyPrint } from '../common/toplevel/Notifier';
import { lightLinkStyle, space_M, space_S } from '../styling/style';
import PublicEntranceContainer from './PublicEntranceContainer';

interface SignInFormProps {
  redirectTo: string | null;
  message?: string | React.ReactNode;
  forceShowCreateAccountButton?: boolean;
}

interface Credentials {
  identifier: string;
  password: string;
  passwordScore: PasswordScore;
}

const defaultCredentials: Credentials = {
  identifier: '',
  password: '',
  passwordScore: {
    score: 0,
    feedback: {
      warning: '',
      suggestions: [],
    },
  },
};

export default function SignInForm({
  redirectTo,
  message,
  forceShowCreateAccountButton,
}: SignInFormProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const [error, setError] = React.useState<Error | WithJsonDiscriminator | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const accountConfig = useAccountConfig();

  const formFields: Field<Credentials>[] = [
    {
      key: 'identifier',
      label: i18n.authentication.field.emailOrUsername,
      type: 'text',
      isMandatory: true,
    },
    {
      key: 'password',
      label: i18n.authentication.field.password,
      type: 'password',
      isMandatory: true,
      showStrengthBar: false,
      strengthProp: 'passwordScore',
    },
  ];

  const signIn = React.useCallback(
    (credentials: Credentials) => {
      startLoading();
      setError(null);

      dispatch(
        API.signInWithLocalAccount({
          identifier: credentials.identifier,
          password: credentials.password,
          passwordScore: credentials.passwordScore,
          errorHandler: (error: WithJsonDiscriminator | Error) => {
            if (error) {
              setError(error);
            }
          },
        }),
      ).then(action => {
        stopLoading();

        if (action.meta.requestStatus === 'fulfilled') {
          if (redirectTo) {
            navigate(redirectTo);
          } else {
            navigate('/');
          }
        }
      });
    },
    [dispatch, navigate, redirectTo, startLoading, stopLoading],
  );

  const errorMessage = React.useMemo(() => {
    if (error) {
      return prettyPrint(error, i18n);
    } else {
      return null;
    }
  }, [error, i18n]);

  return (
    <PublicEntranceContainer>
      {message && <Flex className={css({ marginBottom: space_M })}>{message}</Flex>}
      <Form
        fields={formFields}
        value={defaultCredentials}
        onSubmit={signIn}
        globalErrorMessage={errorMessage}
        submitLabel={i18n.authentication.action.login}
        buttonClassName={css({ margin: space_M + ' auto' })}
        isSubmitInProcess={isLoading}
      />
      <Flex direction="column" justify="center" align="center">
        <InlineLink
          to={buildLinkWithQueryParam('/ForgotPassword', { redirectTo: redirectTo })}
          className={cx(lightLinkStyle, css({ padding: space_S }))}
        >
          {i18n.authentication.action.resetPassword}
        </InlineLink>
        {(forceShowCreateAccountButton || accountConfig.showCreateAccountButton) && (
          <InlineLink
            to={buildLinkWithQueryParam('/SignUp', { redirectTo: redirectTo })}
            className={cx(lightLinkStyle, css({ padding: space_S }))}
          >
            <FontAwesomeIcon icon={faPlus} /> {i18n.authentication.action.createAnAccount}
          </InlineLink>
        )}
      </Flex>
    </PublicEntranceContainer>
  );
}
