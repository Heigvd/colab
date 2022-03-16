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
import FormContainer from '../common/FormContainer';
import { InlineLink } from '../common/Link';
import { lightLinkStyle, space_M } from '../styling/style';
import PasswordFeedbackDisplay from './PasswordFeedbackDisplay';

interface Props {
  redirectTo: string | null;
}

interface Data {
  username: string;
  email: string;
  password: string;
  confirm: string;
  passwordScore: {
    score: number;
    feedback: PasswordFeedback;
  };
}

const defData: Data = {
  username: '',
  email: '',
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

export default function SignUp(props: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const fields: Field<Data>[] = [
    {
      key: 'email',
      label: i18n.emailAddress,
      isErroneous: value => value.email.match('.*@.*') == null,
      errorMessage: i18n.emailAddressNotValid,
      type: 'text',
      isMandatory: true,
    },
    {
      key: 'password',
      label: i18n.model.user.password,
      placeholder: 'Min. 6 characters',
      type: 'password',
      isMandatory: false,
      isErroneous: data => data.passwordScore.score < 2,
      errorMessage: data => <PasswordFeedbackDisplay feedback={data.passwordScore.feedback} />,
      showStrenghBar: true,
      strengthProp: 'passwordScore',
    },
    {
      key: 'confirm',
      type: 'password',
      label: i18n.password_again,
      isMandatory: true,
      isErroneous: data => data.password !== data.confirm,
      errorMessage: i18n.passwordsMismatch,
      showStrenghBar: false,
    },
    {
      key: 'username',
      label: i18n.model.user.username,
      type: 'text',
      isMandatory: true,
      isErroneous: value => value.username.match(/^[a-zA-Z0-9_\\.\\-]+$/) == null,
      errorMessage: i18n.usernameNotValid,
    },
  ];

  const signUpCb = React.useCallback(
    credentials => {
      dispatch(signUp(credentials)).then(action => {
        // is that a hack or not ???
        if (props.redirectTo && action.meta.requestStatus === 'fulfilled') {
          navigate(props.redirectTo);
        }
      });
    },
    [dispatch, props.redirectTo, navigate],
  );

  return (
    <FormContainer>
      <Form
        fields={fields}
        value={defData}
        submitLabel={i18n.createAnAccount}
        onSubmit={signUpCb}
        buttonClassName={css({ margin: space_M + ' auto' })}
      >
        <InlineLink
          className={lightLinkStyle}
          to={buildLinkWithQueryParam('/SignIn', { redirectTo: props.redirectTo })}
        >
          {i18n.cancel}
        </InlineLink>
      </Form>
    </FormContainer>
  );
}