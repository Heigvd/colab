/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { buildLinkWithQueryParam, emailFormat } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Form, { Field, PasswordScore } from '../common/element/Form';
import { InlineLink } from '../common/element/Link';
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
  passwordScore: PasswordScore;
}

const defaultData: FormData = {
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

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const formFields: Field<FormData>[] = [
    {
      key: 'email',
      label: i18n.authentication.field.emailAddress,
      type: 'text',
      isMandatory: true,
      autoComplete: 'off',
      isErroneous: value => value.email.match(emailFormat) == null,
      errorMessage: i18n.authentication.error.emailAddressNotValid,
    },
    {
      key: 'username',
      label: i18n.authentication.field.username,
      type: 'text',
      isMandatory: true,
      autoComplete: 'off',
      isErroneous: value => value.username.match(/^[a-zA-Z0-9_\\-\\.]+$/) == null,
      errorMessage: i18n.authentication.error.usernameNotValid,
    },
    {
      key: 'password',
      label: i18n.authentication.field.password,
      placeholder: i18n.authentication.placeholder.min7Char,
      type: 'password',
      isMandatory: true,
      autoComplete: 'off',
      isErroneous: data => data.passwordScore.score < 2,
      errorMessage: data => <PasswordFeedbackDisplay feedback={data.passwordScore.feedback} />,
      showStrengthBar: true,
      strengthProp: 'passwordScore',
    },
    {
      key: 'confirm',
      label: i18n.authentication.field.passwordConfirmation,
      type: 'password',
      isMandatory: true,
      autoComplete: 'off',
      isErroneous: data => data.password !== data.confirm,
      errorMessage: i18n.authentication.error.passwordsMismatch,
      showStrengthBar: false,
    },
  ];

  const signUp = React.useCallback(
    (data: FormData) => {
      startLoading();

      dispatch(API.signUp(data)).then(action => {
        stopLoading();

        // is that a hack or not ???
        if (redirectTo && action.meta.requestStatus === 'fulfilled') {
          navigate(redirectTo);
        }
      });
    },
    [dispatch, navigate, redirectTo, startLoading, stopLoading],
  );

  return (
    <PublicEntranceContainer>
      <Form
        fields={formFields}
        value={defaultData}
        onSubmit={signUp}
        submitLabel={i18n.authentication.action.createAnAccount}
        buttonClassName={css({ margin: space_M + ' auto' })}
        isSubmitInProcess={isLoading}
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
