/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { buildLinkWithQueryParam } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAccountConfig } from '../../selectors/configSelector';
import { useAppDispatch } from '../../store/hooks';
import { InlineLink } from '../common/element/Link';
import Form, { Field, PasswordScore } from '../common/Form/Form';
import Flex from '../common/layout/Flex';
import { errorColor, lightLinkStyle, space_M, space_S, textSmall } from '../styling/style';
import PublicEntranceContainer from './PublicEntranceContainer';

interface SignInFormProps {
  redirectTo: string | null;
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

export default function SignInForm({ redirectTo }: SignInFormProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();
  const [loginFailed, setLoginFailed] = React.useState<boolean>(false);

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
        dispatch(
          API.signInWithLocalAccount({
            identifier: credentials.identifier,
            password: credentials.password,
            passwordScore: credentials.passwordScore,
          }),
        ).then(action => {
          // is that a hack or not ???
          if (redirectTo && action.meta.requestStatus === 'fulfilled') {
            navigate(redirectTo);
          }
          //not working. Help needed.
        }).catch(() => setLoginFailed(true));
    },
    [dispatch, navigate, redirectTo],
  );

  return (
    <PublicEntranceContainer>
      {loginFailed && (
        <Flex className={cx(css({ color: errorColor, textAlign: 'left' }), textSmall)}>
          The username/email or password is invalid. Please try again.{' '}
        </Flex>
      )}
      <Form
        fields={formFields}
        value={defaultCredentials}
        onSubmit={signIn}
        submitLabel={i18n.authentication.action.login}
        buttonClassName={css({ margin: space_M + ' auto' })}
      />
      <Flex direction="column" justify="center" align="center">
        <InlineLink
          to={buildLinkWithQueryParam('/ForgotPassword', { redirectTo: redirectTo })}
          className={cx(lightLinkStyle, css({ padding: space_S }))}
        >
          {i18n.authentication.action.resetPassword}
        </InlineLink>
        {accountConfig.showCreateAccountButton && (
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
