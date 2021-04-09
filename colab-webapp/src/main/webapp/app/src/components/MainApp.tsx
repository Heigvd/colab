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
import {useAppDispatch, useCurrentUser, useProject} from '../store/hooks';

import {HashRouter as Router, Switch, Route, useParams} from 'react-router-dom';
import Settings from './settings/Settings';
import Admin from './admin/Admin';
import {MainMenuLink} from './common/Link';
import ForgotPassword from './public/ForgotPassword';
import {getDisplayName} from '../helper';
import Team from './projects/Team';
import InlineLoading from './common/InlineLoading';


/**
 * To read parameters from hash
 */
function TeamWrapper() {
  const {id} = useParams<{id: string;}>();

  const dispatch = useAppDispatch();
  const {project, status} = useProject(+id);

  if (project === undefined) {
    if (status === 'NOT_SET') {
      dispatch(API.initProjects());
    }
    return <InlineLoading />
  } else if (project == null) {
    return <div>The project does not exists</div>
  } else {
    return <Team project={project} />;
  }
}



export default () => {
  //const status = useAppSelector((state) => state.navigation.status);
  //const authenticationStatus = useAppSelector(state => state.auth.authenticationStatus);
  const user = useCurrentUser();

  const dispatch = useAppDispatch();

  if (user === undefined) {
    // user is not known. Reload state from API
    dispatch(API.reloadCurrentUser());
    return <Loading />;
  } else if (user === null) {
    // null means the client is not authenticated yet
    return (
      <Router>
        <Switch>
          <Route exact path="/SignUp">
            <SignUpForm />
          </Route>
          <Route exact path="/ForgotPassword">
            <ForgotPassword />
          </Route>
          <Route exact path="/SignIn">
            <SignInForm />
          </Route>
          <Route>
            <SignInForm />
          </Route>
        </Switch>
      </Router>
    );
  } else {
    // user is authenticated
    return (
      <Router>
        <div className={fullPageStyle}>
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
              <MainMenuLink to="/settings">Settings</MainMenuLink>
              {user.admin ? <MainMenuLink to="/admin">Admin</MainMenuLink> : null}
            </nav>
            <div
              className={css({
                flexGrow: 1,
              })}
            ></div>

            {getDisplayName(user)}
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
              <Route path="/team/:id">
                <TeamWrapper />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
};
