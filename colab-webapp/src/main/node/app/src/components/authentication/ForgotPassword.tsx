/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { assertEmailFormat, buildLinkWithQueryParam } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { lightLinkStyle, space_lg } from '../../styling/style';
import Form, { Field } from '../common/element/Form';
import { InlineLink } from '../common/element/Link';
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
      isErroneous: value => !assertEmailFormat(value.email),
      errorMessage: i18n.authentication.error.emailAddressNotValid,
    },
  ];

  const requestPasswordReset = React.useCallback(
    ({ email }: FormData) => {
      startLoading();

      dispatch(API.requestPasswordReset(email)).then(action => {
        stopLoading();
        if (action.meta.requestStatus === 'fulfilled') {
          navigate('../ResetPasswordEmailSent');
        }
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
        className={css({ width: '250px' })}
        buttonClassName={css({ margin: space_lg + ' auto' })}
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
