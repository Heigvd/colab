/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

import Logo from '../images/logo.svg';

import { ColabState, TDispatch } from '../store';
import * as API from '../API';
import { connect } from 'react-redux';
import { css } from '@emotion/css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { ProjectList } from './ProjectList';
import LoginForm from '../SignIn';
import SignUpForm from '../SignUp';
import { fullPageStyle, iconButton } from './style';
import Loading from '../Loading';

interface StateProps {
  authenticationStatus: ColabState['auth']['authenticationStatus'];
  status: ColabState['navigation']['status'];
}

interface DispatchProps {
  reloadCurrentUser: () => void;
  init: () => void;
  signOut: () => void;
}

interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

const MainAppInternal = ({
  init,
  signOut,
  reloadCurrentUser,
  authenticationStatus,
  status,
}: Props) => {
  if (authenticationStatus === undefined) {
    reloadCurrentUser();
  }

  if (authenticationStatus === 'AUTHENTICATED' && status == 'UNINITIALIZED') {
    init();
  }

  if (authenticationStatus === 'UNAUTHENTICATED') {
    return <LoginForm />;
  } else if (authenticationStatus === 'SIGNING_UP') {
    return <SignUpForm />;
  } else if (authenticationStatus === undefined || status === 'UNINITIALIZED') {
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
            pulse={status === 'SYNCING'}
            onClick={() => {
              init();
            }}
            icon={faSync}
          />

          <FontAwesomeIcon
            className={iconButton}
            onClick={() => {
              signOut();
            }}
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

export default connect<StateProps, DispatchProps, OwnProps, ColabState>(
  (state: ColabState) => ({
    status: state.navigation.status,
    authenticationStatus: state.auth.authenticationStatus,
  }),
  (dispatch: TDispatch) => ({
    init: () => {
      dispatch(API.initData());
    },
    reloadCurrentUser: () => {
      dispatch(API.reloadCurrentUser());
    },
    signOut: () => {
      dispatch(API.signOut());
    },
  }),
)(MainAppInternal);
