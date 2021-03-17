/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { css } from '@emotion/css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { TDispatch, ColabState } from './store';
import { connect } from 'react-redux';
import FormContainer from './FormContainer';
import InlineLoading from './InlineLoading';
import { signUp } from './API';
import { changeAuthenticationStatus } from './store/auth';

interface StateProps {}

interface DispatchProps {
  signUp: (username: string, email: string, password: string) => void;
  goToSignIn: () => void;
}

interface OwnProps {
  redirectTo?: string;
}

type Props = StateProps & DispatchProps & OwnProps;

const PasswordStrengthBar = React.lazy(() => import('react-password-strength-bar'));

function SignUpForm({ signUp, goToSignIn }: Props) {
  const [credentials, setCredentials] = React.useState({
    passwordScore: 0,
    username: '',
    email: '',
    password: '',
  });

  return (
    <FormContainer>
      <div>
        <div>
          <label>
            username
            <input
              type="text"
              onChange={e => setCredentials({ ...credentials, username: e.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
            email address
            <input
              type="text"
              onChange={e => setCredentials({ ...credentials, email: e.target.value })}
            />
          </label>
        </div>
        <div>
          <React.Suspense fallback={<InlineLoading />}>
            <label>
              password
              <div
                className={css({
                  display: 'inline-block',
                })}
              >
                <input
                  type="password"
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                />
                <PasswordStrengthBar
                  onChangeScore={e => setCredentials({ ...credentials, passwordScore: e })}
                  password={credentials.password}
                />
              </div>
            </label>
          </React.Suspense>
        </div>
        <div>
          <button
            className={css({
              background: '#666',
              fontSize: '1.2em',
              cursor: 'pointer',
              padding: '15px',
              width: 'max-content',
              color: 'white',
              margin: 'auto',
              ':hover': {
                backgroundColor: '#404040',
              },
            })}
            onClick={() => signUp(credentials.username, credentials.email, credentials.password)}
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
          <span onClick={goToSignIn}>cancel</span>
        </div>
      </div>
    </FormContainer>
  );
}

export default connect<StateProps, DispatchProps, OwnProps, ColabState>(
  _state => ({}),
  (dispatch: TDispatch) => ({
    signUp: (username: string, email: string, password: string) => {
      dispatch(signUp(username, email, password));
    },
    goToSignIn: () => {
      dispatch(changeAuthenticationStatus('UNAUTHENTICATED'));
    },
  }),
)(SignUpForm);
