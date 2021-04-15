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
import InlineLoading from '../common/InlineLoading';
import { signUp } from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { darkMode, buttonStyle } from '../styling/style';
import { InlineLink } from '../common/Link';

interface Props {
  redirectTo?: string;
}

const PasswordStrengthBar = React.lazy(() => import('react-password-strength-bar'));

export default (_props: Props) => {
  const dispatch = useAppDispatch();

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
            className={cx(
              darkMode,
              buttonStyle,
              css({
                padding: '5px',
                width: 'max-content',
                margin: 'auto',
              }),
            )}
            onClick={() => dispatch(signUp(credentials))}
          >
            <span
              className={css({
                padding: '0 5px',
              })}
            >
              Sign up
            </span>
            <FontAwesomeIcon
              className={css({
                padding: '0 5px',
              })}
              icon={faSignInAlt}
            />
          </button>
          <InlineLink to="/SignIn">cancel</InlineLink>
        </div>
      </div>
    </FormContainer>
  );
};
