/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { signUp } from '../../API/api';
import { buildLinkWithQueryParam } from '../../helper';
import { useAppDispatch } from '../../store/hooks';
import FormContainer from '../common/FormContainer';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import { InlineLink } from '../common/Link';
import { buttonStyle } from '../styling/style';

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

  const signUpCb = React.useCallback(() => {
    dispatch(signUp(credentials)).then(action => {
      // is that a hack or not ???
      if (props.redirectTo && action.meta.requestStatus === 'fulfilled') {
        history.push(props.redirectTo);
      }
    });
  }, [dispatch, credentials, props.redirectTo, history]);

  const onEnterSignUpCb = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter') {
        signUpCb();
      }
    },
    [signUpCb],
  );

  return (
    <FormContainer>
      <div onKeyDown={onEnterSignUpCb}>
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
          <IconButton className={buttonStyle} icon={faSignInAlt} onClick={signUpCb}>
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
