/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { buildLinkWithQueryParam, emailFormat } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { InlineLink } from '../common/element/Link';
import Form, { Field } from '../common/Form/Form';
import { lightLinkStyle, space_M } from '../styling/style';
import PublicEntranceContainer from './PublicEntranceContainer';

interface ResetPasswordFormProps {
  redirectTo: string | null;
}

interface FormData {
  email: string;
}

const defaultData: FormData = { email: '' };

export default function ResetPasswordForm({ redirectTo }: ResetPasswordFormProps): JSX.Element {
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
      isErroneous: value => value.email.match(emailFormat) == null,
      errorMessage: i18n.authentication.error.emailAddressNotValid,
    },
  ];

  const requestPasswordReset = React.useCallback(
    ({ email }: FormData) => {
      startLoading();

      dispatch(API.requestPasswordReset(email)).then(() => {
        stopLoading();

        navigate('../ResetPasswordEmailSent');
      });
    },
    [dispatch, navigate, startLoading, stopLoading],
  );

  return (
    <PublicEntranceContainer>
      <Form
        fields={formFields}
        value={defaultData}
        onSubmit={requestPasswordReset}
        submitLabel={i18n.authentication.action.sendMePassword}
        isSubmitInProcess={isLoading}
        buttonClassName={css({ margin: space_M + ' auto' })}
      >
        <InlineLink
          className={cx(lightLinkStyle)}
          to={buildLinkWithQueryParam('/SignIn', { redirectTo: redirectTo })}
        >
          {i18n.common.cancel}
        </InlineLink>
      </Form>
    </PublicEntranceContainer>
  );
}
