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
import FormContainer from './FormContainer';
import { darkMode } from './comp/style';
import { signInWithLocalAccount } from './API/api';
import { changeAuthenticationStatus } from './store/auth';
import { useAppDispatch } from './store/hooks';

interface Props {
  redirectTo?: string;
}

export default function SignInForm(_props: Props) {
  const dispatch = useAppDispatch();

  const [credentials, setCredentials] = React.useState({
    identifier: '',
    password: '',
  });

  const dis = {
    signIn: (identifier: string, password: string) => {
      dispatch(signInWithLocalAccount({ identifier, password }));
    },
    gotoSignUp: () => {
      dispatch(changeAuthenticationStatus('SIGNING_UP'));
    },
  };

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

      <button
        className={cx(
          darkMode,
          css({
            cursor: 'pointer',
            padding: '5px',
            width: 'max-content',
            margin: 'auto',
            ':hover': {
              backgroundColor: 'var(--hoverColor)',
            },
          }),
        )}
        onClick={() => dis.signIn(credentials.identifier, credentials.password)}
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
      </button>
      <span onClick={dis.gotoSignUp}>sign up</span>
    </FormContainer>
  );
}
