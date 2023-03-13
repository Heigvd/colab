/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import * as React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import * as API from '../API/api';
import useTranslations from '../i18n/I18nContext';
import { useCurrentUser } from '../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import AboutColab from './AboutColab';
import Admin from './admin/Admin';
import ResetPasswordForm from './authentication/ForgotPassword';
import SignInForm from './authentication/SignIn';
import SignUpForm from './authentication/SignUp';
import InlineLoading from './common/element/InlineLoading';
import Flex from './common/layout/Flex';
import Loading from './common/layout/Loading';
import Overlay from './common/layout/Overlay';
import ErrorPage from './common/toplevel/404ErrorPage';
import MainNav from './MainNav';
import { MyModels, MyProjects } from './projects/ProjectList';
import Settings from './settings/Settings';

interface HomeWrapperProps {
  children: JSX.Element;
}
function HomeWrapper({ children }: HomeWrapperProps): JSX.Element {
  return (
    <Flex direction="column" align="stretch" className={css({ height: '100vh' })}>
      <MainNav />
      <Routes>
        <Route path="settings/*" element={<Settings />} />
        <Route path="admin/*" element={<Admin />} />
        <Route path="*" element={children} />
      </Routes>
    </Flex>
  );
}

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
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<SignInForm redirectTo={query.get('redirectTo')} />} />
          <Route path="/signup" element={<SignUpForm redirectTo={query.get('redirectTo')} />} />
          <Route
            path="/password-reset"
            element={<ResetPasswordForm redirectTo={query.get('redirectTo')} />}
          />
          <Route path="/about-colab" element={<AboutColab />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        {reconnecting}
      </>
    );
  } else if (currentUser != null) {
    // user is authenticated
    return (
      <>
        <Routes>
          <Route
            path="/m/*"
            element={
              <HomeWrapper>
                <MyModels />
              </HomeWrapper>
            }
          />
          <Route
            path="/p/*"
            element={
              <>
                <HomeWrapper>
                  <MyProjects />
                </HomeWrapper>
              </>
            }
          />
          <Route path="settings/*" element={<Settings />} />
          <Route path="admin/*" element={<Admin />} />
          <Route path="about-colab" element={<AboutColab />} />
          <Route path="/" element={<Navigate to="/p" replace />} />
          <Route path="*" element={<ErrorPage />} />
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
