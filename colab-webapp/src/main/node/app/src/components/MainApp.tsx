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
  faSignOutAlt,
  faTimes,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as API from '../API/api';
import { useProject, useProjectBeingEdited } from '../selectors/projectSelector';
import { useCurrentUser } from '../selectors/userSelector';
import { shallowEqual, useAppDispatch, useAppSelector } from '../store/hooks';
import Admin from './admin/Admin';
import DropDownMenu from './common/DropDownMenu';
import IconButton from './common/IconButton';
import InlineLoading from './common/InlineLoading';
import { MainMenuLink } from './common/Link';
import Loading from './common/Loading';
import Overlay from './common/Overlay';
import Debugger from './debugger/debugger';
import Editor from './projects/edition/Editor';
import { UserProjects } from './projects/ProjectList';
import ForgotPassword from './public/ForgotPassword';
import SignInForm from './public/SignIn';
import SignUpForm from './public/SignUp';
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

/**
 * To read parameters from hash
 */
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

  const { currentUser, status: currentUserStatus } = useCurrentUser();
  const currentAccounts = useAppSelector(
    state => Object.values(state.users.accounts).filter(a => a.userId == state.auth.currentUserId),
    shallowEqual,
  );

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

  const passwordScore = useAppSelector(state => state.auth.localAccountPasswordScore);

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
      <>
        <Routes>
          <Route path="/SignUp" element={<SignUpForm redirectTo={query.get('redirectTo')} />} />
          <Route
            path="/ForgotPassword"
            element={<ForgotPassword redirectTo={query.get('redirectTo')} />}
          />
          <Route path="/SignIn" element={<SignInForm redirectTo={query.get('redirectTo')} />} />
          <Route path="*" element={<SignInForm redirectTo={query.get('redirectTo')} />} />
        </Routes>
        {reconnecting}
      </>
    );
  } else if (currentUser != null) {
    // user is authenticated
    return (
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
              {projectBeingEdited != null ? (
                <MainMenuLink to={`/editor/${projectBeingEdited.id}`}>
                  {projectBeingEdited.name}
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
              ) : null}
            </nav>
            <div
              className={css({
                flexGrow: 1,
              })}
            ></div>
            <DropDownMenu
              icon={faCog}
              valueComp={{ value: '', label: '' }}
              entries={[
                { value: '/settings/display', label: 'Display settings' },
                { value: '/settings', label: 'Other settings' },
                ...(currentUser.admin ? [{ value: '/debug', label: 'Debug' }] : []),
                ...(currentUser.admin ? [{ value: '/admin', label: 'Admin' }] : []),
              ]}
              onSelect={val => {
                val.action != null ? val.action() : navigate(val.value);
              }}
              buttonClassName={invertedThemeMode}
            />
            <DropDownMenu
              icon={faUserCircle}
              valueComp={{ value: '', label: '' }}
              entries={[
                { value: '/settings/user', label: 'Profile' },
                ...currentAccounts.map(account => {
                  return {
                    value: `/settings/account/${account.id}`,
                    label: `Edit ${account.email}`,
                  };
                }),
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
              onSelect={val => {
                val.action != null ? val.action() : navigate(val.value);
              }}
              buttonClassName={cx(invertedThemeMode, css({ marginLeft: space_S }))}
            />
            {passwordScore != null && passwordScore.score < 2 ? (
              <FontAwesomeIcon title={'your password is weak'} icon={faExclamationTriangle} />
            ) : null}
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
              <Route path="/" element={<UserProjects />} />
              <Route path="/settings/*" element={<Settings />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/editor/:id/*" element={<EditorWrapper />} />
              <Route path="/debug" element={<Debugger />} />
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
    );
  } else {
    return (
      <Overlay>
        <i>Inconsistent state</i>
      </Overlay>
    );
  }
}
