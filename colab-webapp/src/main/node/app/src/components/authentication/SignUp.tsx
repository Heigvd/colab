/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { WithJsonDiscriminator } from 'colab-rest-client';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { assertEmailFormat, assertUserNameFormat, buildLinkWithQueryParam } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { lightLinkStyle, space_lg } from '../../styling/style';
import Form, { Field, PasswordScore } from '../common/element/Form';
import { InlineLink } from '../common/element/Link';
import { prettyPrint } from '../common/toplevel/Notifier';
import PasswordFeedbackDisplay from './PasswordFeedbackDisplay';
import PublicEntranceContainer from './PublicEntranceContainer';

interface SignUpFormProps {
  redirectTo: string | null;
}

interface FormData {
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  affiliation: string;
  password: string;
  confirm: string;
  passwordScore: PasswordScore;
  agreed: boolean;
}

const defaultData: FormData = {
  email: '',
  username: '',
  firstname: '',
  lastname: '',
  affiliation: '',
  password: '',
  confirm: '',
  passwordScore: {
    score: 0,
    feedback: {
      warning: '',
      suggestions: [],
    },
  },
  agreed: false,
};

export default function SignUpForm({ redirectTo }: SignUpFormProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const [error, setError] = React.useState<Error | WithJsonDiscriminator | null>(null);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const formFields: Field<FormData>[] = [
    {
      key: 'email',
      label: i18n.authentication.label.emailAddress,
      type: 'text',
      isMandatory: true,
      autoComplete: 'off',
      isErroneous: value => !assertEmailFormat(value.email),
      errorMessage: i18n.authentication.error.emailAddressNotValid,
    },
    {
      key: 'password',
      label: i18n.authentication.label.password,
      placeholder: i18n.authentication.info.min7Char,
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
      label: i18n.authentication.label.passwordConfirmation,
      type: 'password',
      isMandatory: true,
      autoComplete: 'off',
      isErroneous: data => data.password !== data.confirm,
      errorMessage: i18n.authentication.error.passwordsMismatch,
      showStrengthBar: false,
    },
    {
      key: 'username',
      label: i18n.authentication.label.username,
      type: 'text',
      isMandatory: true,
      autoComplete: 'off',
      isErroneous: value => !assertUserNameFormat(value.username),
      errorMessage: i18n.authentication.error.usernameNotValid,
    },
    {
      key: 'firstname',
      label: i18n.authentication.label.firstname,
      type: 'text',
      isMandatory: true,
      autoComplete: 'off',
    },
    {
      key: 'lastname',
      label: i18n.authentication.label.lastname,
      type: 'text',
      isMandatory: true,
      autoComplete: 'off',
    },
    {
      key: 'affiliation',
      label: i18n.authentication.label.affiliation,
      type: 'text',
      isMandatory: false,
      autoComplete: 'off',
    },

    {
      key: 'agreed',
      label: (
        <span>
          {i18n.authentication.label.iAccept + ' '}
          <Link to="../terms-of-use" target="_blank" onClick={e => e.stopPropagation()}>
            {i18n.authentication.label.termOfUse}
          </Link>
          {' ' + i18n.common.and + ' '}
          <Link to="../data-policy" target="_blank" onClick={e => e.stopPropagation()}>
            {i18n.authentication.label.dataPolicy}
          </Link>
        </span>
      ),
      type: 'boolean',
      showAs: 'checkbox',
      isMandatory: true,
      isErroneous: data => !data.agreed,
      errorMessage: i18n.authentication.error.notAgreed,
    },
  ];

  const signUp = React.useCallback(
    (data: FormData) => {
      startLoading();
      setError(null);

      dispatch(
        API.signUp({
          ...data,
          errorHandler: (error: WithJsonDiscriminator | Error) => {
            if (error) {
              setError(error);
            }
          },
        }),
      ).then(action => {
        stopLoading();

        // is that a hack or not ???
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
      <Form
        fields={formFields}
        value={defaultData}
        onSubmit={signUp}
        globalErrorMessage={errorMessage}
        submitLabel={i18n.authentication.action.createAnAccount}
        className={css({ width: '250px' })}
        buttonClassName={css({ margin: space_lg + ' auto' })}
        isSubmitInProcess={isLoading}
      >
        <InlineLink
          to={buildLinkWithQueryParam('/login', { redirectTo: redirectTo })}
          className={lightLinkStyle}
        >
          {i18n.common.cancel}
        </InlineLink>
      </Form>
    </PublicEntranceContainer>
  );
}
