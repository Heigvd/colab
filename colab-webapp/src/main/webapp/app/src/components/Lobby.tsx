/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

import Logo from '../images/logo.svg';

import * as API from '../API/api';
import { css } from '@emotion/css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { ProjectList } from './projects/ProjectList';
import SignInForm from './public/SignIn';
import SignUpForm from './public/SignUp';
import { fullPageStyle, iconButton } from './style';
import Loading from './common/Loading';
import { useAppSelector, useAppDispatch } from '../store/hooks';

export default () => {
  //const status = useAppSelector((state) => state.navigation.status);
  const authenticationStatus = useAppSelector(state => state.auth.authenticationStatus);
  const dispatch = useAppDispatch();

  if (authenticationStatus === undefined) {
    dispatch(API.reloadCurrentUser());
  }

  if (authenticationStatus === 'UNAUTHENTICATED') {
    return <SignInForm />;
  } else if (authenticationStatus === 'SIGNING_UP') {
    return <SignUpForm />;
  } else if (authenticationStatus === undefined) {
    return <Loading />;
  } else {
    // authenticationStatus := AUTHENTICATED
    // status := SYNCING || READY
    return (
      <div className={fullPageStyle}>
        <div
          className={css({
            borderBottom: '1px solid grey',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          })}
        >
          <Logo
            className={css({
              height: '36px',
              width: 'auto',
              padding: '5px',
            })}
          />
          <div
            className={css({
              flexGrow: 1,
            })}
          ></div>

          <FontAwesomeIcon
            className={iconButton}
            onClick={() => dispatch(API.signOut())}
            icon={faSignOutAlt}
          />
        </div>

        <div
          className={css({
            flexGrow: 1,
          })}
        >
          <ProjectList />
        </div>
      </div>
    );
  }
};
