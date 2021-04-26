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
import InlineLoading from '../common/InlineLoading';
import { signUp } from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { buttonStyle } from '../styling/style';
import { InlineLink } from '../common/Link';
import IconButton from '../common/IconButton';
import { buildLinkWithQueryParam } from '../../helper';
import { useHistory } from 'react-router-dom';

interface Props {
  redirectTo: string | null;
}

const PasswordStrengthBar = React.lazy(() => import('react-password-strength-bar'));

export default (props: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const history = useHistory();

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
          <IconButton
            className={buttonStyle}
            icon={faSignInAlt}
            onClick={() => {
              dispatch(signUp(credentials)).then(action => {
                // is that a hack or not ???
                if (props.redirectTo && action.meta.requestStatus === 'fulfilled') {
                  history.push(props.redirectTo);
                }
              });
            }}
          >
            Sign up
          </IconButton>
          <InlineLink to={buildLinkWithQueryParam('/SignIn', { redirectTo: props.redirectTo })}>
            cancel
          </InlineLink>
        </div>
      </div>
    </FormContainer>
  );
};
