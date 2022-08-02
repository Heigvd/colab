/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import * as API from '../API/api';
import useTranslations from '../i18n/I18nContext';
import { useProject, useProjectBeingEdited } from '../selectors/projectSelector';
import { useCurrentUser } from '../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import AboutColab from './AboutColab';
import Admin from './admin/Admin';
import ResetPasswordForm from './authentication/ForgotPassword';
import ResetPasswordSent from './authentication/ResetPasswordSent';
import SignInForm from './authentication/SignIn';
import SignUpForm from './authentication/SignUp';
import InlineLoading from './common/element/InlineLoading';
import Loading from './common/layout/Loading';
import Overlay from './common/layout/Overlay';
import MainNav from './MainNav';
import Editor from './projects/edition/Editor';
import { UserProjects } from './projects/ProjectList';
import Settings from './settings/Settings';
import {
  fullPageStyle,
  invertedThemeMode,
  space_M,
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
    <Overlay>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
        })}
      >
        <InlineLoading colour={true} /> <span>{i18n.authentication.info.reconnecting}</span>
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
          <Route path="/about-colab" element={<AboutColab />} />
        </Routes>
        {reconnecting}
      </>
    );
  } else if (currentUser != null) {
    // user is authenticated
    return (
      <>
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
                    <MainNav />
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
              </>
            }
          />
          <Route path="/about-colab" element={<AboutColab />} />
        </Routes>
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
