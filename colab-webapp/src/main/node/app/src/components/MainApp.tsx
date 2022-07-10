/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import {
  faCog,
  faExclamationTriangle,
  faMeteor,
  faSignOutAlt,
  faUser,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as API from '../API/api';
import useTranslations from '../i18n/I18nContext';
import { useProject, useProjectBeingEdited } from '../selectors/projectSelector';
import { useCurrentUser } from '../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Admin from './admin/Admin';
import ResetPasswordForm from './authentication/ForgotPassword';
import ResetPasswordSent from './authentication/ResetPasswordSent';
import SignInForm from './authentication/SignIn';
import SignUpForm from './authentication/SignUp';
import DropDownMenu from './common/DropDownMenu';
import InlineLoading from './common/InlineLoading';
import { MainMenuLink } from './common/Link';
import Loading from './common/Loading';
import Overlay from './common/Overlay';
import Editor from './projects/edition/Editor';
import { UserProjects } from './projects/ProjectList';
import Settings from './settings/Settings';
import Picto from './styling/Picto';
import {
  flex,
  fullPageStyle,
  invertedThemeMode,
  paddingAroundStyle,
  space_M,
  space_S,
} from './styling/style';

const EditorWrapper = () => {
  const { id: sId } = useParams<'id'>();

  const id = +sId!;

  const dispatch = useAppDispatch();
  const { project, status } = useProject(+id!);
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
  const navigate = useNavigate();
  const i18n = useTranslations();

  const { currentUser, status: currentUserStatus } = useCurrentUser();

  const socketId = useAppSelector(state => state.websockets.sessionId);

  //const { project: projectBeingEdited } = useProjectBeingEdited();

  const logout = React.useCallback(() => {
    dispatch(API.signOut());
  }, [dispatch]);

  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

  const passwordScore = useAppSelector(state => state.auth.localAccountPasswordScore);

  const reconnecting = socketId == null && (
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
  );

  const query = useQuery();

  if (currentUserStatus === 'NOT_INITIALIZED') {
    return <Loading />;
  } else if (currentUserStatus == 'LOADING') {
    return <Loading />;
  } else if (currentUserStatus === 'NOT_AUTHENTICATED') {
    return (
      <>
        <Routes>
          <Route path="/SignIn" element={<SignInForm redirectTo={query.get('redirectTo')} />} />
          <Route path="/SignUp" element={<SignUpForm redirectTo={query.get('redirectTo')} />} />
          <Route
            path="/ForgotPassword"
            element={<ResetPasswordForm redirectTo={query.get('redirectTo')} />}
          />
          <Route path="/ResetPasswordEmailSent" element={<ResetPasswordSent />} />
          <Route path="*" element={<SignInForm redirectTo={query.get('redirectTo')} />} />
        </Routes>
        {reconnecting}
      </>
    );
  } else if (currentUser != null) {
    // user is authenticated
    return (
      <Routes>
        <Route path="/editor/:id/*" element={<EditorWrapper />} />
        <Route
          path="*"
          element={
            <>
              <div className={fullPageStyle}>
                <div
                  className={cx(
                    invertedThemeMode,
                    css({
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      boxSizing: 'border-box',
                      padding: '0 ' + space_M,
                    }),
                  )}
                >
                  <Picto
                    className={cx(
                      css({
                        height: '30px',
                        width: 'auto',
                        paddingRight: space_M,
                      }),
                      paddingAroundStyle([1, 3, 4], space_S),
                    )}
                  />
                  <nav className={flex}>
                    <MainMenuLink to="/">Projects</MainMenuLink>
                    {/*
                    
                    {projectBeingEdited != null && (
                      <MainMenuLink to={`/editor/${projectBeingEdited.id}`}>
                        {projectBeingEdited.name || 'New project'}
                        <IconButton
                          onClick={events => {
                            // make sure to go back to projects page before closing project
                            // to avoid infinite loop
                            events.preventDefault();
                            navigate('/');
                            dispatch(API.closeCurrentProject());
                          }}
                          icon={faTimes}
                          title="Close current project"
                          className={css({
                            pointerEvents: 'auto',
                            marginLeft: space_M,
                            padding: 0,
                            ':hover': {
                              backgroundColor: 'transparent',
                            },
                          })}
                        />
                      </MainMenuLink>
                    )} */}
                  </nav>
                  <div
                    className={css({
                      flexGrow: 1,
                    })}
                  ></div>
                  <DropDownMenu
                    icon={faUserCircle}
                    title={currentUser.username}
                    valueComp={{ value: '', label: '' }}
                    entries={[
                      {
                        value: 'username',
                        label: (
                          <>
                            <div
                              className={css({
                                borderBottom: '1px solid var(--darkGray)',
                                padding: space_S,
                              })}
                            >
                              <FontAwesomeIcon icon={faUser} />{' '}
                              {currentUser.firstname && currentUser.lastname
                                ? currentUser.firstname + ' ' + currentUser.lastname
                                : currentUser.username}
                            </div>
                          </>
                        ),
                        disabled: true,
                      },
                      {
                        value: 'settings',
                        label: (
                          <>
                            <FontAwesomeIcon icon={faCog} /> Settings
                          </>
                        ),
                        action: () => navigate('/settings'),
                      },
                      ...(currentUser.admin
                        ? [
                            {
                              value: 'admin',
                              label: (
                                <>
                                  <FontAwesomeIcon icon={faMeteor} /> Admin
                                </>
                              ),
                              action: () => navigate('/admin'),
                            },
                          ]
                        : []),
                      {
                        value: 'logout',
                        label: (
                          <>
                            Logout <FontAwesomeIcon icon={faSignOutAlt} />
                          </>
                        ),
                        action: logout,
                      },
                    ]}
                    buttonClassName={cx(invertedThemeMode, css({ marginLeft: space_S }))}
                  />
                  {passwordScore != null && passwordScore.score < 2 && (
                    <FontAwesomeIcon
                      title={i18n.authentication.error.yourPasswordIsWeak}
                      icon={faExclamationTriangle}
                    />
                  )}
                </div>

                <div
                  className={css({
                    flexGrow: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    '& > *': {
                      flexGrow: 1,
                    },
                  })}
                >
                  <Routes>
                    <Route path="/*" element={<UserProjects />} />
                    <Route path="/settings/*" element={<Settings />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="/editor/:id/*" element={<EditorWrapper />} />
                    <Route
                      element={
                        /* no matching route, redirect to projects */
                        <Navigate to="/" />
                      }
                    />
                  </Routes>
                </div>
              </div>
              {reconnecting}
            </>
          }
        />
      </Routes>
    );
  } else {
    return (
      <Overlay>
        <i>Inconsistent state</i>
      </Overlay>
    );
  }
}
