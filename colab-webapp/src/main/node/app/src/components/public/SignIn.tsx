/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithLocalAccount } from '../../API/api';
import { buildLinkWithQueryParam } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAccountConfig } from '../../selectors/configSelector';
import { useAppDispatch } from '../../store/hooks';
import Form, { Field, PasswordScore } from '../common/Form/Form';
import FormContainer from '../common/FormContainer';
import { InlineLink } from '../common/Link';

interface Props {
  redirectTo: string | null;
}

interface Credentials {
  identifier: string;
  password: string;
  passwordScore: PasswordScore;
}

const defCred: Credentials = {
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

export default function SignInForm({ redirectTo }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const navigate = useNavigate();

  const accountConfig = useAccountConfig();

  const formFields: Field<Credentials>[] = [
    {
      key: 'identifier',
      placeholder: i18n.emailOrUsername,
      isErroneous: data => data.identifier.length === 0,
      errorMessage: i18n.pleaseEnterId,
      type: 'text',
      isMandatory: false,
      //readonly: signWithUsernameOnly,
    },
    {
      key: 'password',
      placeholder: i18n.model.user.password,
      type: 'password',
      isMandatory: false,
      strengthProp: 'passwordScore',
      showStrenghBar: false,
      fieldFooter: (
        <InlineLink
          className={css({ alignSelf: 'flex-start' })}
          to={buildLinkWithQueryParam('/ForgotPassword', { redirectTo: redirectTo })}
        >
          {i18n.forgottenPassword}
        </InlineLink>
      ),
    },
  ];

  const onSubmitCb = React.useCallback(
    (credentials: Credentials) => {
      dispatch(
        signInWithLocalAccount({
          identifier: credentials.identifier,
          password: credentials.password,
          passwordScore: credentials.passwordScore,
        }),
      ).then(action => {
        // is that a hack or not ???
        if (redirectTo && action.meta.requestStatus === 'fulfilled') {
          navigate(redirectTo);
        }
      });
    },
    [dispatch, redirectTo, navigate],
  );

  return (
    <FormContainer>
      <Form
        value={{ ...defCred, identifier: '' }}
        onSubmit={onSubmitCb}
        fields={formFields}
        submitLabel={i18n.login}
      >
        {accountConfig.showCreateAccountButton ? (
          <InlineLink
            className={css({ alignSelf: 'center' })}
            to={buildLinkWithQueryParam('/SignUp', { redirectTo: redirectTo })}
          >
            <FontAwesomeIcon icon={faPlusCircle} /> {i18n.createAnAccount}{' '}
          </InlineLink>
        ) : null}
      </Form>
    </FormContainer>
  );
}
