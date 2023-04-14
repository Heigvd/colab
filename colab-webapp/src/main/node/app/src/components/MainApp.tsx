/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import * as API from '../API/api';
import useTranslations from '../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useCurrentUser } from '../store/selectors/userSelector';
import Admin from './admin/Admin';
import ResetPasswordForm from './authentication/ForgotPassword';
import ResetPasswordSent from './authentication/ResetPasswordSent';
import SignInForm from './authentication/SignIn';
import SignUpForm from './authentication/SignUp';
import InlineLoading from './common/element/InlineLoading';
import Flex from './common/layout/Flex';
import Loading from './common/layout/Loading';
import Overlay from './common/layout/Overlay';
import MainNav from './MainNav';
import EditorWrapper from './projects/edition/EditorWrapper';
import NewModelShared from './projects/models/NewModelShared';
import NewProjectAccess from './projects/NewProjectAccess';
import { MyModels, MyProjects } from './projects/ProjectList';
import Settings from './settings/Settings';

export default function MainApp(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { currentUser, status: currentUserStatus } = useCurrentUser();

  const socketId = useAppSelector(state => state.websockets.sessionId);

  //const { project: projectBeingEdited } = useProjectBeingEdited();

  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

  const reconnecting = socketId == null && (
    <Overlay
      backgroundStyle={css({
        backgroundColor: 'var(--blackWhite-700)',
        userSelect: 'none',
      })}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        })}
      >
        <InlineLoading />
        <span>{i18n.authentication.info.reconnecting}</span>
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
      <>
        <Routes>
          <Route path="/editor/:projectId/*" element={<ProjectRouting />} />
          <Route
            path="*"
            element={
              <>
                <Flex direction="column" align="stretch" className={css({ height: '100vh' })}>
                  <MainNav />
                  <Flex
                    direction="column"
                    align="stretch"
                    className={css({
                      flexGrow: 1,
                      overflowY: 'auto',
                      '& > *': {
                        flexGrow: 1,
                      },
                    })}
                  >
                    <Routes>
                      <Route path="/*" element={<MyProjects />} />
                      <Route path="/projects" element={<MyProjects />} />
                      <Route path="/models/*" element={<MyModels />} />
                      <Route path="/settings/*" element={<Settings />} />
                      <Route path="/admin/*" element={<Admin />} />
                      {/* <Route path="/editor/:projectId/*" element={<EditorWrapper />} /> */}
                      <Route
                        element={
                          /* no matching route, redirect to projects */
                          <Navigate to="/" />
                        }
                      />
                      {/* this path comes from the server side (ModelSharingToken.java) */}
                      <Route path="/new-model-shared/:projectId" element={<NewModelShared />} />
                      {/* this path comes from the server side (InvitationToken.java) */}
                      <Route path="/new-project-access/:projectId" element={<NewProjectAccess />} />
                    </Routes>
                  </Flex>
                </Flex>
              </>
            }
          />
          {/* this path comes from the server side (ResetLocalAccountPasswordToken.java) */}
          <Route path="/go-to-profile" element={<Navigate to="/settings/user" />} />
        </Routes>
        {reconnecting}
      </>
    );
  } else {
    return (
      <Overlay>
        <i>{i18n.activity.inconsistentState}</i>
      </Overlay>
    );
  }
}

// /**
//  * To read parameters from URL
//  */
function ProjectRouting() {
  const { projectId } = useParams<'projectId'>();

  return <EditorWrapper projectId={+projectId!} />;
}

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
