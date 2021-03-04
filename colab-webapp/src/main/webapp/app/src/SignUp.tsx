/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from "react";
import {css, cx} from "@emotion/css";

import Logo from "./images/logo.svg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignInAlt} from "@fortawesome/free-solid-svg-icons";
import {TDispatch, ColabState, signInWithLocalAccount, signUp, ACTIONS} from "./store";
import {connect} from "react-redux";


interface StateProps {
};

interface DispatchProps {
  signUp: (username: string, email: string, password: string) => void;
  goToSignIn: () =>void
}

interface OwnProps {
  redirectTo?: string;
}

type Props = StateProps & DispatchProps & OwnProps;



function SignUpForm({signUp, redirectTo, goToSignIn}: Props) {

  const [credentials, setCredentials] = React.useState({
    username: '',
    email: '',
    password: '',
  })

  return (
    <div id="main">
      <div>
        <div
          className={cx(
            css({
              margin: "100px auto"
            })
          )}
        >
          <div
            className={cx(
              css({
                display: "flex",
                backgroundColor: 'grey'
              })
            )}
          >
            <Logo
              className={css({
                height: "110px",
                width: "200px",
                padding: "10px"
              })}
            />
            <h1
              className={css({
                padding: "10px",
                color: "white"
              })}
            >
              co.LAB
            </h1>
          </div>
          <div
            className={css({
              textAlign: "center",
              padding: "10px"
            })}
          >
            <div>
              <label>username
                <input type='text' onChange={(e) => setCredentials({...credentials, username: e.target.value})} />
              </label>
              <label>email address
                <input type='text' onChange={(e) => setCredentials({...credentials, email: e.target.value})} />
              </label>
              <label>password
                <input type='password' onChange={(e) => setCredentials({...credentials, password: e.target.value})} />
              </label>
            </div>
            <button
              className={css({
                background: "#666",
                fontSize: "1.2em",
                cursor: "pointer",
                padding: "15px",
                width: "max-content",
                color: "white",
                margin: "auto",
                ":hover": {
                  backgroundColor: "#404040"
                }
              })}
              onClick={() =>
                signUp(credentials.username, credentials.email, credentials.password)
              }
            >
              <span
                className={css({
                  padding: "0 5px"
                })}
              >
                Login
              </span>
              <FontAwesomeIcon
                className={css({
                  padding: "0 5px"
                })}
                icon={faSignInAlt}
              />
            </button>
            <span onClick={goToSignIn}>cancel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect<StateProps, DispatchProps, OwnProps, ColabState>(
  _state => ({
  }),
  (dispatch: TDispatch) => ({
    signUp: (username:string, email: string, password: string) => {
      dispatch(signUp(username, email, password));
    },
    goToSignIn: () => {
      dispatch(ACTIONS.changeStatus('UNAUTHENTICATED'));
    }
  })
)(SignUpForm);
