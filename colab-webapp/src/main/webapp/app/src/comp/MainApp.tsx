/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from "react";

import Logo from "../images/logo.svg";

import LogoBw from "../images/logo_bw.svg";
import {ColabState, TDispatch, initData, reloadCurrentUser, signOut} from "../store";
import {connect} from "react-redux";
import {css, cx} from "@emotion/css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSync, faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import {ProjectList} from "./ProjectList";
import LoginForm from "../SignIn";
import SignUpForm from "../SignUp";
import {fullPageStyle, pulseEase, iconButton} from "./style";


interface StateProps {
  authenticationStatus: ColabState['authenticationStatus'];
  status: ColabState["status"];
};

interface DispatchProps {
  reloadCurrentUser: () => void;
  init: () => void;
  signOut: () => void;
}

interface OwnProps {

}

type Props = StateProps & DispatchProps & OwnProps;

const MainAppInternal = ({
  init,
  signOut,
  reloadCurrentUser,
  authenticationStatus,
  status
}: Props) => {


  if (authenticationStatus === undefined) {
    reloadCurrentUser();
  }

  if (authenticationStatus === 'AUTHENTICATED' && status == 'UNINITIALIZED') {
    init();
  }

  if (authenticationStatus === "UNAUTHENTICATED") {
    return <LoginForm />
  } else if (authenticationStatus === "SIGNING_UP") {
    return <SignUpForm />
  } else if (authenticationStatus === undefined || status === "UNINITIALIZED") {
    return (
      <div className={fullPageStyle}>
        <div
          className={css({
            margin: "auto"
          })}
        >
          <LogoBw className={cx(pulseEase, css({
            width: "200px",
            maxWidth: "10wv",
          }))} />
        </div>
      </div>
    );
  } else {
    // authenticationStatus := AUTHENTICATED
    // status := SYNCING || READY
    return (
      <div className={fullPageStyle}>
        <div className={css({
          borderBottom: "1px solid grey",
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        })}>
          <Logo
            className={css({
              width: "36px",
              height: "auto",
              padding: '5px'
            })}
          />
          <div className={css({
            flexGrow: 1,
          })}
          >
            coLAB
          </div>

          <FontAwesomeIcon
            className={iconButton}
            pulse={status === "SYNCING"}
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

        <div className={css({
          flexGrow: 1
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
    status: state.status,
    authenticationStatus: state.authenticationStatus,
  }),
  (dispatch: TDispatch) => ({
    init: () => {
      dispatch(initData());
    },
    reloadCurrentUser: () => {
      dispatch(reloadCurrentUser());
    },
    signOut: () => {
      dispatch(signOut())
    }
  })
)(MainAppInternal);
