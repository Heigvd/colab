/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { css, cx } from '@emotion/css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import FormContainer from '../common/FormContainer';
import { darkMode, buttonStyle } from '../styling/style';
import { signInWithLocalAccount } from '../../API/api';
import { changeAuthenticationStatus } from '../../store/auth';
import { useAppDispatch } from '../../store/hooks';

interface Props {
  redirectTo?: string;
}

export default function SignInForm(_props: Props) {
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

      <span
        className={cx(
          darkMode,
          buttonStyle,
          css({
            padding: '5px',
            width: 'max-content',
            margin: 'auto',
          }),
        )}
        onClick={() => dispatch(signInWithLocalAccount(credentials))}
      >
        <span
          className={css({
            padding: '0 5px',
          })}
        >
          Login
        </span>
        <FontAwesomeIcon
          className={css({
            padding: '0 5px',
          })}
          icon={faSignInAlt}
        />
      </span>
      <span
        className={buttonStyle}
        onClick={() => dispatch(changeAuthenticationStatus('SIGNING_UP'))}
      >
        sign up
      </span>
    </FormContainer>
  );
}
