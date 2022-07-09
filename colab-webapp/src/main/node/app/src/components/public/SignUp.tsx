/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { PasswordFeedback } from 'react-password-strength-bar';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { buildLinkWithQueryParam } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Form, { Field } from '../common/Form/Form';
import { InlineLink } from '../common/Link';
import { lightLinkStyle, space_M } from '../styling/style';
import PasswordFeedbackDisplay from './PasswordFeedbackDisplay';
import PublicEntranceContainer from './PublicEntranceContainer';

interface SignUpFormProps {
  redirectTo: string | null;
}

interface FormData {
  email: string;
  username: string;
  password: string;
  confirm: string;
  passwordScore: {
    score: number;
    feedback: PasswordFeedback;
  };
}

const defaultFormData: FormData = {
  email: '',
  username: '',
  password: '',
  confirm: '',
  passwordScore: {
    score: 0,
    feedback: {
      warning: '',
      suggestions: [],
    },
  },
};

export default function SignUpForm({ redirectTo }: SignUpFormProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const formFields: Field<FormData>[] = [
    {
      key: 'email',
      label: i18n.authentication.field.emailAddress,
      type: 'text',
      isMandatory: true,
      isErroneous: value => value.email.match('.+@.+') == null,
      errorMessage: i18n.authentication.error.emailAddressNotValid,
    },
    {
      key: 'username',
      label: i18n.authentication.field.username,
      type: 'text',
      isMandatory: true,
      isErroneous: value => value.username.match(/^[a-zA-Z0-9_\\-\\.]+$/) == null,
      errorMessage: i18n.authentication.error.usernameNotValid,
    },
    {
      key: 'password',
      label: i18n.authentication.field.password,
      placeholder: i18n.authentication.placeholder.min7Char,
      type: 'password',
      isMandatory: true,
      isErroneous: data => data.passwordScore.score < 2,
      errorMessage: data => <PasswordFeedbackDisplay feedback={data.passwordScore.feedback} />,
      showStrenghBar: true,
      strengthProp: 'passwordScore',
    },
    {
      key: 'confirm',
      label: i18n.authentication.field.passwordConfirmation,
      type: 'password',
      isMandatory: true,
      isErroneous: data => data.password !== data.confirm,
      errorMessage: i18n.authentication.error.passwordsMismatch,
      showStrenghBar: false,
    },
  ];

  const signUp = React.useCallback(
    data => {
      dispatch(API.signUp(data)).then(action => {
        // is that a hack or not ???
        if (redirectTo && action.meta.requestStatus === 'fulfilled') {
          navigate(redirectTo);
        }
      });
    },
    [dispatch, navigate, redirectTo],
  );

  return (
    <PublicEntranceContainer>
      <Form
        fields={formFields}
        value={defaultFormData}
        onSubmit={signUp}
        submitLabel={i18n.authentication.action.createAnAccount}
        buttonClassName={css({ margin: space_M + ' auto' })}
      >
        <InlineLink
          to={buildLinkWithQueryParam('/SignIn', { redirectTo: redirectTo })}
          className={lightLinkStyle}
        >
          {i18n.common.cancel}
        </InlineLink>
      </Form>
    </PublicEntranceContainer>
  );
}
