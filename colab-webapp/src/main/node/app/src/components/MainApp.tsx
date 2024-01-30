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
import { useAppDispatch } from '../store/hooks';
import { useColabConfig, useTermsOfUseTime } from '../store/selectors/configSelector';
import { useCurrentUser } from '../store/selectors/userSelector';
import { useSessionId } from '../store/selectors/websocketSelector';
import AboutColab from './AboutColab';
import DataPolicyEN from './DataPolicyEN';
import MainNav from './MainNav';
import ReconnectingOverlay from './ReconnectingOverlay';
import TermsOfUseEN from './TermsOfUseEN';
import AdminTabs from './admin/AdminTabs';
import ResetPasswordForm from './authentication/ForgotPassword';
import ResetPasswordSent from './authentication/ResetPasswordSent';
import SignInForm from './authentication/SignIn';
import SignUpForm from './authentication/SignUp';
import UpdateTermsOfUseForm from './authentication/UpdateTermsOfUse';
import Flex from './common/layout/Flex';
import Loading from './common/layout/Loading';
import Overlay from './common/layout/Overlay';
import NewProjectAccess from './projects/NewProjectAccess';
import { MyModels, MyProjects } from './projects/ProjectList';
import ProjectsBin from './projects/ProjectsBin';
import EditorWrapper from './projects/edition/EditorWrapper';
import NewModelShared from './projects/models/NewModelShared';
import SettingsTabs from './settings/SettingsTabs';

export default function MainApp(): React.ReactElement {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const socketId = useSessionId();
  const isReconnecting = socketId == null;

  useColabConfig();

  const TermsOfUseTime = useTermsOfUseTime();

  const { currentUser, status: currentUserStatus } = useCurrentUser();

  //const { project: projectBeingEdited } = useProjectBeingEdited();

  const isUserAgreedTimeValid = React.useMemo(() => {
    if (currentUser && currentUser.agreedTime != null && TermsOfUseTime != 'LOADING') {
      const userAgreedTimestamp = new Date(currentUser.agreedTime);
      // We create a unix time and set it with the policy time
      const termsOfUseTimestamp = new Date(0);
      termsOfUseTimestamp.setUTCMilliseconds(TermsOfUseTime);
      return userAgreedTimestamp > termsOfUseTimestamp;
    } else {
      return false;
    }
  }, [TermsOfUseTime, currentUser]);

  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

  const query = useQuery();

  if (currentUserStatus === 'NOT_INITIALIZED') {
    return <Loading />;
  }

  if (currentUserStatus == 'LOADING') {
    return <Loading />;
  }

  if (currentUserStatus === 'NOT_AUTHENTICATED') {
    return (
      <>
        <Routes>
          <Route path="/login" element={<SignInForm redirectTo={query.get('redirectTo')} />} />
          <Route path="/signup" element={<SignUpForm redirectTo={query.get('redirectTo')} />} />
          <Route
            path="/password-change"
            element={<ResetPasswordForm redirectTo={query.get('redirectTo')} />}
          />
          <Route path="/password-change-sent" element={<ResetPasswordSent />} />
          <Route path="*" element={<SignInForm redirectTo={query.get('redirectTo')} />} />
          <Route path="/about-colab" element={<AboutColab />} />
          <Route path="/terms-of-use" element={<TermsOfUseEN />} />
          <Route path="/data-policy" element={<DataPolicyEN />} />
        </Routes>
        {isReconnecting && <ReconnectingOverlay />}
      </>
    );
  } else if (currentUser != null) {
    if (TermsOfUseTime === 'LOADING') {
      return <Loading />;
    } else if (!isUserAgreedTimeValid) {
      return (
        <>
          <Routes>
            <Route path="/*" element={<UpdateTermsOfUseForm />} />
            <Route path="/about-colab" element={<AboutColab />} />
            <Route path="/terms-of-use" element={<TermsOfUseEN />} />
            <Route path="/data-policy" element={<DataPolicyEN />} />
          </Routes>
          {isReconnecting && <ReconnectingOverlay />}
        </>
      );
    }
    // user is authenticated
    return (
      <>
        <Routes>
          <Route path="/project/:projectId/*" element={<EditorRouting />} />
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
                      <Route path="/settings/*" element={<SettingsTabs />} />
                      <Route path="/admin/*" element={<AdminTabs />} />
                      <Route path="/bin/*" element={<ProjectsBin />} />
                      {/* <Route path="/project/:projectId/*" element={<EditorWrapper />} /> */}
                      <Route
                        element={
                          /* no matching route, redirect to projects */
                          <Navigate to="/" />
                        }
                      />
                      {/* this path comes from the server side (InvitationToken.java) */}
                      <Route path="/new-project-access/:projectId" element={<NewProjectAccess />} />
                      {/* this path comes from the server side (ModelSharingToken.java) */}
                      <Route path="/new-model-shared/:projectId" element={<NewModelShared />} />
                    </Routes>
                  </Flex>
                </Flex>
              </>
            }
          />
          {/* this path comes from the server side (ResetLocalAccountPasswordToken.java) */}
          <Route path="/go-to-profile" element={<Navigate to="/settings/user" />} />
        </Routes>
        {isReconnecting && <ReconnectingOverlay />}
      </>
    );
  }

  // should not happen
  return (
    <Overlay>
      <i>{i18n.activity.inconsistentState}</i>
    </Overlay>
  );
}

// /**
//  * To read parameters from URL
//  */
function EditorRouting() {
  const { projectId } = useParams<'projectId'>();

  return <EditorWrapper projectId={+projectId!} />;
}

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
