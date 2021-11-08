/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import {
  HashRouter as Router,
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
} from 'react-router-dom';
import * as API from '../API/api';
import { getDisplayName } from '../helper';
import { useProject, useProjectBeingEdited } from '../selectors/projectSelector';
import { useCurrentUser } from '../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Admin from './admin/Admin';
import IconButton from './common/IconButton';
import InlineLoading from './common/InlineLoading';
import { InlineLink, MainMenuLink } from './common/Link';
import Loading from './common/Loading';
import Overlay from './common/Overlay';
import Debugger from './debugger/debugger';
import Editor from './projects/edition/Editor';
import { UserProjects } from './projects/ProjectList';
import ForgotPassword from './public/ForgotPassword';
import SignInForm from './public/SignIn';
import SignUpForm from './public/SignUp';
import Settings from './settings/Settings';
import Logo from './styling//WhiteLogo';
import { fullPageStyle, invertedThemeMode } from './styling/style';

/**
 * To read parameters from hash
 */
const EditorWrapper = () => {
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();
  const { project, status } = useProject(+id);
  const { project: editedProject, status: editingStatus } = useProjectBeingEdited();

  React.useEffect(() => {
    if (
      project != null &&
      (editingStatus === 'NOT_EDITING' || (editedProject != null && editedProject.id !== +id))
    ) {
      dispatch(API.startProjectEdition(project));
    }
  }, [dispatch, editingStatus, editedProject, project, id]);

  React.useEffect(() => {
    if (project === undefined && status === 'NOT_INITIALIZED') {
      dispatch(API.getUserProjects());
    }
  }, [project, status, dispatch]);

  if (project === undefined) {
    return <InlineLoading />;
  } else if (project == null) {
    return <div>There is no project yet</div>;
  } else {
    if (editingStatus === 'NOT_EDITING' || (editedProject != null && editedProject.id !== +id)) {
      return <InlineLoading />;
    } else {
      return <Editor />;
    }
  }
};

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function MainApp(): JSX.Element {
  const dispatch = useAppDispatch();

  const { currentUser, status: currentUserStatus } = useCurrentUser();

  const socketId = useAppSelector(state => state.websockets.sessionId);

  const { project: projectBeingEdited } = useProjectBeingEdited();

  const logout = React.useCallback(() => {
    dispatch(API.signOut());
  }, [dispatch]);

  React.useEffect(() => {
    if (currentUserStatus == 'UNKNOWN') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

  const reconnecting =
    socketId == null ? (
      <Overlay>
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
          })}
        >
          <InlineLoading colour={true} /> <span>reconnecting...</span>
        </div>
      </Overlay>
    ) : null;

  const query = useQuery();

  if (currentUserStatus == 'UNKNOWN') {
    return <Loading />;
  } else if (currentUserStatus == 'LOADING') {
    return <Loading />;
  } else if (currentUserStatus == 'NOT_AUTHENTICATED') {
    return (
      <Router>
        <Switch>
          <Route exact path="/SignUp">
            <SignUpForm redirectTo={query.get('redirectTo')} />
          </Route>
          <Route exact path="/ForgotPassword">
            <ForgotPassword redirectTo={query.get('redirectTo')} />
          </Route>
          <Route exact path="/SignIn">
            <SignInForm redirectTo={query.get('redirectTo')} />
          </Route>
          <Route>
            <SignInForm redirectTo={query.get('redirectTo')} />
          </Route>
        </Switch>
        {reconnecting}
      </Router>
    );
  } else if (currentUser != null) {
    // user is authenticated
    return (
      <Router>
        <div className={fullPageStyle}>
          <div
            className={cx(
              invertedThemeMode,
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
              {projectBeingEdited != null ? (
                <MainMenuLink
                  to={`/editor/${projectBeingEdited.id}`}
                  isActive={(match, _location) => {
                    if (match) {
                      return match.url.startsWith(`/editor/${projectBeingEdited.id}`);
                    }
                    return false;
                  }}
                >
                  Project {projectBeingEdited.name}
                </MainMenuLink>
              ) : null}
              <MainMenuLink to="/settings">Settings</MainMenuLink>
              {currentUser.admin ? <MainMenuLink to="/debug">debug</MainMenuLink> : null}
              {currentUser.admin ? <MainMenuLink to="/admin">Admin</MainMenuLink> : null}
            </nav>
            <div
              className={css({
                flexGrow: 1,
              })}
            ></div>

            <InlineLink to="/settings/user">{getDisplayName(currentUser)}</InlineLink>
            <IconButton onClick={logout} icon={faSignOutAlt} />
          </div>

          <div
            className={css({
              flexGrow: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              '& > *': {
                padding: '0 30px 30px 30px',
                flexGrow: 1,
              },
            })}
          >
            <Switch>
              <Route exact path="/">
                <UserProjects />
              </Route>
              <Route path="/settings">
                <Settings />
              </Route>
              <Route path="/admin">
                <Admin />
              </Route>
              <Route path="/editor/:id">
                <EditorWrapper />
              </Route>
              <Route path="/debug">
                <Debugger />
              </Route>
              <Route>
                {/* no matching route, redirect to projects */}
                <Redirect to="/" />
              </Route>
            </Switch>
          </div>
        </div>
        {reconnecting}
      </Router>
    );
  } else {
    return (
      <Overlay>
        <i>Inconsistent state</i>
      </Overlay>
    );
  }
}
