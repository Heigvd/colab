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
import { signUp } from '../../API/api';
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
      label: i18n.emailAddress,
      type: 'text',
      isMandatory: true,
      isErroneous: value => value.email.match('.*@.*') == null,
      errorMessage: i18n.emailAddressNotValid,
    },
    {
      key: 'username',
      label: i18n.model.user.username,
      type: 'text',
      isMandatory: true,
      isErroneous: value => value.username.match(/^[a-zA-Z0-9_\\.\\-]+$/) == null,
      errorMessage: i18n.usernameNotValid,
    },
    {
      key: 'password',
      label: i18n.model.user.password,
      placeholder: 'Min. 6 characters',
      type: 'password',
      isMandatory: true,
      isErroneous: data => data.passwordScore.score < 2,
      errorMessage: data => <PasswordFeedbackDisplay feedback={data.passwordScore.feedback} />,
      showStrenghBar: true,
      strengthProp: 'passwordScore',
    },
    {
      type: 'password',
      key: 'confirm',
      label: i18n.password_again,
      isMandatory: true,
      isErroneous: data => data.password !== data.confirm,
      errorMessage: i18n.passwordsMismatch,
      showStrenghBar: false,
    },
  ];

  const doSignUp = React.useCallback(
    data => {
      dispatch(signUp(data)).then(action => {
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
        submitLabel={i18n.createAnAccount}
        onSubmit={doSignUp}
        buttonClassName={css({ margin: space_M + ' auto' })}
      >
        <InlineLink
          to={buildLinkWithQueryParam('/SignIn', { redirectTo: redirectTo })}
          className={lightLinkStyle}
        >
          {i18n.cancel}
        </InlineLink>
      </Form>
    </PublicEntranceContainer>
  );
}
