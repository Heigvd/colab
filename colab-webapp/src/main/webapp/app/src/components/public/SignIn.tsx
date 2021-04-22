/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { css } from '@emotion/css';

import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import FormContainer from '../common/FormContainer';
import { buttonStyle } from '../styling/style';
import { signInWithLocalAccount } from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { InlineLink } from '../common/Link';
import IconButton from '../common/IconButton';

interface Props {
  redirectTo?: string;
}

export default function SignInForm(_props: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const [credentials, setCredentials] = React.useState({
    identifier: '',
    password: '',
  });

  return (
    <FormContainer>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <label>
          username or email address
          <input
            type="text"
            onChange={e => setCredentials({ ...credentials, identifier: e.target.value })}
          />
        </label>
        <label>
          password
          <input
            type="password"
            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
          />
        </label>
      </div>

      <IconButton
        className={buttonStyle}
        icon={faSignInAlt}
        onClick={() => dispatch(signInWithLocalAccount(credentials))}
      >
        Sign in
      </IconButton>
      <InlineLink to="/SignUp">create a account</InlineLink>
      <InlineLink to="/ForgotPassword">forgot your password ?</InlineLink>
    </FormContainer>
  );
}
