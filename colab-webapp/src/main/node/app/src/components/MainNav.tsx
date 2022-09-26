/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faCircleInfo,
  faCog,
  faExclamationTriangle,
  faMeteor,
  faSignOutAlt,
  faUser,
  faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../API/api';
import useTranslations from '../i18n/I18nContext';
import LanguageSelector from '../i18n/LanguageSelector';
import { useCurrentUser } from '../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import InlineLoading from './common/element/InlineLoading';
import { MainMenuLink } from './common/element/Link';
import Clickable from './common/layout/Clickable';
import DropDownMenu from './common/layout/DropDownMenu';
import Monkeys from './debugger/monkey/Monkeys';
import Picto from './styling/Picto';
import { flex, invertedThemeMode, paddingAroundStyle, space_M, space_S } from './styling/style';

export default function MainNav(): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();
  return (
    <>
      <Clickable onClick={() => navigate(`/`)}>
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
      </Clickable>
      <nav className={flex}>
        <MainMenuLink to="/">{i18n.modules.project.labels.projects}</MainMenuLink>
        {/* {projectBeingEdited != null && (
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
      <Monkeys />
      <UserDropDown />
    </>
  );
}

export function UserDropDown({ onlyLogout }: { onlyLogout?: boolean }): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const { currentUser, status: currentUserStatus } = useCurrentUser();

  const logout = React.useCallback(() => {
    dispatch(API.signOut()).then(() => navigate(`/`));
  }, [dispatch, navigate]);

  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

  const passwordScore = useAppSelector(state => state.auth.localAccountPasswordScore);

  if (currentUser != null) {
    return (
      <>
        <LanguageSelector />
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
            ...(!onlyLogout
              ? [
                  {
                    value: 'settings',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faCog} /> {i18n.common.settings}
                      </>
                    ),
                    action: () => navigate('./settings/user'),
                  },
                ]
              : []),
            ...(currentUser.admin && !onlyLogout
              ? [
                  {
                    value: 'admin',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faMeteor} /> {i18n.admin.admin}
                      </>
                    ),
                    action: () => navigate('./admin/main'),
                  },
                ]
              : []),
            ...(!onlyLogout
              ? [
                  {
                    value: 'about',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faCircleInfo} /> {i18n.common.about}
                      </>
                    ),
                    action: () => navigate('/about-colab'),
                  },
                ]
              : []),
            {
              value: 'logout',
              label: (
                <>
                  <FontAwesomeIcon icon={faSignOutAlt} /> {i18n.common.logout}
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
      </>
    );
  } else return <InlineLoading />;
}
