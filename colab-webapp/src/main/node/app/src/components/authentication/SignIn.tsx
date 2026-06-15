/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { WithJsonDiscriminator } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { buildLinkWithQueryParam } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { useColabConfig } from '../../store/selectors/configSelector';
import { lightLinkStyle, p_sm, space_lg, text_xs } from '../../styling/style';
import Form, { Field, PasswordScore } from '../common/element/Form';
import { InlineLink } from '../common/element/Link';
import Flex from '../common/layout/Flex';
import { prettyPrint } from '../common/toplevel/Notifier';
import PublicEntranceContainer from './PublicEntranceContainer';

interface SignInFormProps {
  redirectTo: string | null;
  messages?: string[];
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
  messages,
  forceShowCreateAccountButton,
}: SignInFormProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const [error, setError] = React.useState<Error | WithJsonDiscriminator | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const config = useColabConfig();

  const formFields: Field<Credentials>[] = [
    {
      key: 'identifier',
      label: i18n.authentication.label.emailOrUsername,
      type: 'text',
      isMandatory: true,
    },
    {
      key: 'password',
      label: i18n.authentication.label.password,
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
      {messages &&
        messages.map(message => {
          return (
            <Flex key={messages.indexOf(message)} className={css({ marginBottom: space_lg })}>
              {message}
            </Flex>
          );
        })}
      <Form
        fields={formFields}
        value={defaultCredentials}
        onSubmit={signIn}
        globalErrorMessage={errorMessage}
        submitLabel={i18n.authentication.action.login}
        className={css({ width: '250px' })}
        buttonClassName={css({ margin: space_lg + ' auto' })}
        isSubmitInProcess={isLoading}
      />
      <Flex direction="column" justify="center" align="center">
        <InlineLink
          to={buildLinkWithQueryParam('/password-change', { redirectTo: redirectTo })}
          className={cx(lightLinkStyle, p_sm, text_xs)}
        >
          {i18n.authentication.action.resetPassword}
        </InlineLink>
        {(forceShowCreateAccountButton || config.showCreateAccountButton) && (
          <InlineLink
            to={buildLinkWithQueryParam('/signup', { redirectTo: redirectTo })}
            className={cx(lightLinkStyle, p_sm, text_xs)}
          >
            {i18n.authentication.action.createAnAccount}
          </InlineLink>
        )}
      </Flex>
    </PublicEntranceContainer>
  );
}
