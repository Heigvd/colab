/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from "react";

import Logo from "../images/logo.svg";

import LogoBw from "../images/logo_bw.svg";
import {ColabState, TDispatch, initData, reloadCurrentUser} from "../store";
import {connect} from "react-redux";
import {css, cx} from "@emotion/css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSpinner, faSync} from "@fortawesome/free-solid-svg-icons";
import {ProjectList} from "./ProjectList";
import LoginForm from "../SignIn";
import SignUpForm from "../SignUp";

const MainAppInternal = ({
  init,
  reloadCurrentUser,
  status
}: {
  status: ColabState["status"];
  reloadCurrentUser: () => void;
  init: () => void;
}) => {

  const [forceUserReload, setForceUserReload] = React.useState(true);

  if (forceUserReload) {
    reloadCurrentUser();
    setForceUserReload(false);
  }

  if (status === "UNAUTHENTICATED") {
    return <LoginForm />
  } else if (status === "SIGNING_UP") {
    return <SignUpForm />
  } else if (status === "UNINITIALIZED") {
    init();
    return (
      <div>
        <div
          className={css({
            margin: "auto"
          })}
        >
          <LogoBw class='fa-pulse' />
          <FontAwesomeIcon size="2x" icon={faSpinner} pulse />
        </div>
      </div>
    );
  } else {
    return (
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      })}>
        <div className={css({
          borderBottomm: "1px solid grey",
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
            className={css({
              marginRight: "10px"
            })}
            spin={status === "SYNC"}
            onClick={() => {
              init();
            }}
            icon={faSync}
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

export const MainApp = connect(
  (state: ColabState) => ({
    status: state.status
  }),
  (dispatch: TDispatch) => ({
    init: () => {
      dispatch(initData());
    },
    reloadCurrentUser: () => {
      dispatch(reloadCurrentUser());
    }
  })
)(MainAppInternal);
