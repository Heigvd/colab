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
import { TDispatch, ColabState } from './store';
import { connect } from 'react-redux';
import FormContainer from './FormContainer';
import { darkMode } from './comp/style';
import { signInWithLocalAccount } from './API';
import { changeAuthenticationStatus } from './store/auth';

interface StateProps {}

interface DispatchProps {
  signIn: (identifier: string, password: string) => void;
  gotoSignUp: () => void;
}

interface OwnProps {
  redirectTo?: string;
}

type Props = StateProps & DispatchProps & OwnProps;

function SignInForm({ signIn, gotoSignUp }: Props) {
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
        onClick={() => signIn(credentials.identifier, credentials.password)}
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
      <span onClick={gotoSignUp}>sign up</span>
    </FormContainer>
  );
}

export default connect<StateProps, DispatchProps, OwnProps, ColabState>(
  _state => ({}),
  (dispatch: TDispatch) => ({
    signIn: (identifier: string, password: string) => {
      dispatch(signInWithLocalAccount(identifier, password));
    },
    gotoSignUp: () => {
      dispatch(changeAuthenticationStatus('SIGNING_UP'));
    },
  }),
)(SignInForm);
