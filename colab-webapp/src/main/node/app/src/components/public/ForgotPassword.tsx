/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import { requestPasswordReset } from '../../API/api';
import { buildLinkWithQueryParam } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Form, { Field } from '../common/Form/Form';
import FormContainer from '../common/FormContainer';
import { InlineLink } from '../common/Link';
import { lightLinkStyle, space_M } from '../styling/style';

interface Props {
  redirectTo: string | null;
}

interface Data {
  email: string;
}

export default function ForgotPassword(props: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const onSubmitCb = React.useCallback(
    (data: Data) => {
      dispatch(requestPasswordReset(data));
    },
    [dispatch],
  );

  const formFields: Field<Data>[] = [
    {
      key: 'email',
      label: i18n.emailAddress,
      isErroneous: value => value.email.match('.*@.*') == null,
      errorMessage: i18n.emailAddressNotValid,
      type: 'text',
      isMandatory: true,
    },
  ];

  return (
    <FormContainer>
      <Form
        onSubmit={onSubmitCb}
        value={{ email: '' }}
        fields={formFields}
        submitLabel={i18n.sendMePassword}
        buttonClassName={css({ margin: space_M + ' auto' })}
      >
        <InlineLink
          className={cx(lightLinkStyle)}
          to={buildLinkWithQueryParam('/SignIn', { redirectTo: props.redirectTo })}
        >
          {i18n.cancel}
        </InlineLink>
      </Form>
    </FormContainer>
  );
}