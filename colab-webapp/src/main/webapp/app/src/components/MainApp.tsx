/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

import Logo from './styling//WhiteLogo';

import * as API from '../API/api';
import {css, cx} from '@emotion/css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons';
import {CardList} from './cards/CardList';
import {ProjectList} from './projects/ProjectList';
import SignInForm from './public/SignIn';
import SignUpForm from './public/SignUp';
import {fullPageStyle, iconButton, darkMode} from './styling/style';
import Loading from './common/Loading';
import {useAppSelector, useAppDispatch, useCurrentUser} from '../store/hooks';

import {HashRouter as Router, Switch, Route} from 'react-router-dom';
import Settings from './settings/Settings';
import Admin from './admin/Admin';
import {MainMenuLink} from './common/Link';


export default () => {
  //const status = useAppSelector((state) => state.navigation.status);
  const authenticationStatus = useAppSelector(state => state.auth.authenticationStatus);
  const user = useCurrentUser();

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
  } else if (user != null) {
    // authenticationStatus := AUTHENTICATED
    // status := SYNCING || READY
    const displayName = user.commonname || `${user.firstname} ${user.lastname}`.trim() || user.username;
    return (
      <div className={fullPageStyle}>
        <Router>
          <div
            className={cx(
              darkMode,
              css({
                borderBottom: '6px solid grey',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                height: '46px',
                boxSizin: 'border-box',
              }),
            )}
          >
            <Logo
              className={css({
                height: '36px',
                width: 'auto',
                padding: '5px',
              })}
            />
            <nav>
              <MainMenuLink exact to="/">
                Projects
              </MainMenuLink>
              <MainMenuLink exact to="/cards">
                Cards
              </MainMenuLink>
              <MainMenuLink to="/settings">
                Settings
              </MainMenuLink>
              {user.admin ? <MainMenuLink to="/admin">Admin</MainMenuLink> : null}
            </nav>
            <div
              className={css({
                flexGrow: 1,
              })}
            ></div>

            {displayName}
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
            <Switch>
              <Route exact path="/">
                <ProjectList />
              </Route>
              <Route exact path="/cards">
                <CardList />
              </Route>
              <Route path="/settings">
                <Settings />
              </Route>
              <Route path="/admin">
                <Admin />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  } else {
    // unreachable...
    return null;
  }
};
