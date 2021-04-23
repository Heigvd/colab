/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import { css, cx } from '@emotion/css';

import FormContainer from '../common/FormContainer';
import { darkMode, linkStyle } from '../styling/style';
import { requestPasswordReset } from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { InlineLink } from '../common/Link';
import { buildLinkWithQueryParam } from '../../helper';

interface Props {
  redirectTo: string | null;
}

export default (props: Props): JSX.Element => {
  const dispatch = useAppDispatch();

  const [credentials, setCredentials] = React.useState({
    email: '',
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
          email address
          <input type="text" onChange={e => setCredentials({ email: e.target.value })} />
        </label>
      </div>

      <button
        className={cx(
          darkMode,
          linkStyle,
          css({
            padding: '5px',
            width: 'max-content',
            margin: 'auto',
          }),
        )}
        onClick={() => dispatch(requestPasswordReset(credentials))}
      >
        <span
          className={css({
            padding: '0 5px',
          })}
        >
          Submit
        </span>
      </button>
      <InlineLink to={buildLinkWithQueryParam('/SignIn', { redirectTo: props.redirectTo })}>
        cancel
      </InlineLink>
    </FormContainer>
  );
};
