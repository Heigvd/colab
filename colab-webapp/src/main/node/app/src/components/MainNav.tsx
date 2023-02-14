/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as API from '../API/api';
import useTranslations from '../i18n/I18nContext';
import LanguageSelector from '../i18n/LanguageSelector';
import { useHasModels } from '../selectors/projectSelector';
import { useCurrentUser } from '../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import InlineLoading from './common/element/InlineLoading';
import { MainMenuLink, } from './common/element/Link';
import DropDownMenu from './common/layout/DropDownMenu';
import Icon from './common/layout/Icon';
import Monkeys from './debugger/monkey/Monkeys';
import {buttonStyle, space_lg, space_sm } from './styling/style';
const dropLabelsStyle = css({
  //width: '100%',
  textTransform: 'uppercase',
  padding: space_lg,
});

export default function MainNav(): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const hasModels = useHasModels();
  const entries = [
    {
      value: '/',
      label: <div className={dropLabelsStyle}>{i18n.modules.project.labels.projects}</div>,
    },
    {
      value: '/models',
      label: <div className={dropLabelsStyle}>{i18n.modules.project.labels.models}</div>,
    },
  ];
  const value = location.pathname;
  return (
    <>
      {/* <MainMenuLink to={`/`} className={mainMenuLink}>
         <Icon icon={faHouse} size='lg'/>
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
      </MainMenuLink> */}
      {hasModels ? (
        <nav>
          <DropDownMenu
            value={value}
            entries={entries}
            onSelect={e => navigate(e.value)}
            menuIcon="BURGER"
            buttonClassName={cx(buttonStyle, css({ padding: '0 0 0 ' + space_lg }))}
          />
        </nav>
      ) : (
        <MainMenuLink to="/">{i18n.modules.project.labels.projects}</MainMenuLink>
      )}
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
          icon={'account_circle'}
          title={currentUser.username}
          valueComp={{ value: '', label: '' }}
          entries={[
            {
              value: 'username',
              label: (
                <>
                  <div
                    className={css({
                      borderBottom: '1px solid var(--secondary-main)',
                      padding: space_sm,
                    })}
                  >
                     <Icon icon={'person'} />{' '}
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
                         <Icon icon={'settings'} /> {i18n.user.settings}
                      </>
                    ),
                    action: () => navigate('./settings'),
                  },
                ]
              : []),
            ...(currentUser.admin && !onlyLogout
              ? [
                  {
                    value: 'admin',
                    label: (
                      <>
                         <Icon icon={'admin_panel_settings'} /> {i18n.admin.admin}
                      </>
                    ),
                    action: () => navigate('./admin'),
                  },
                ]
              : []),
            ...(!onlyLogout
              ? [
                  {
                    value: 'about',
                    label: (
                      <>
                         <Icon icon={'info'} /> {i18n.common.about}
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
                   <Icon icon={'logout'} /> {i18n.common.logout}
                </>
              ),
              action: logout,
            },
          ]}
          buttonClassName={css({ marginLeft: space_sm })}
        />
        {passwordScore != null && passwordScore.score < 2 && (
           <Icon
            title={i18n.authentication.error.yourPasswordIsWeak}
            icon={'warning'}
          />
        )}
      </>
    );
  } else return <InlineLoading />;
}
