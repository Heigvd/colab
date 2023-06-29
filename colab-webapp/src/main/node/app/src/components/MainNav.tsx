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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useHasModels } from '../store/selectors/projectSelector';
import { useCurrentUser } from '../store/selectors/userSelector';
import { ghostIconButtonStyle, iconButtonStyle, p_sm, space_sm } from '../styling/style';
import Avatar from './common/element/Avatar';
import InlineLoading from './common/element/InlineLoading';
import { MainMenuLink } from './common/element/Link';
import DropDownMenu from './common/layout/DropDownMenu';
import Flex from './common/layout/Flex';
import Icon from './common/layout/Icon';
import Monkeys from './debugger/monkey/Monkeys';
const dropLabelsStyle = cx(
  p_sm,
  css({
    textTransform: 'uppercase',
  }),
);

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
    <Flex className={p_sm} justify={'space-between'}>
      {hasModels ? (
        <nav>
          <DropDownMenu
            value={value}
            entries={entries}
            onSelect={e => navigate(e.value)}
            menuIcon="BURGER"
            buttonClassName={cx(
              iconButtonStyle,
              ghostIconButtonStyle,
              css({ alignItems: 'center', paddingRight: 0 }),
            )}
            showSelectedLabel
          />
        </nav>
      ) : (
        <MainMenuLink to="/" className={dropLabelsStyle}>
          {i18n.modules.project.labels.projects}
        </MainMenuLink>
      )}
      <Monkeys />
      <UserDropDown />
    </Flex>
  );
}

export function UserDropDown(): JSX.Element {
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
      <div>
        <DropDownMenu
          buttonLabel={<Avatar currentUser={currentUser} />}
          title={currentUser.username}
          valueComp={{ value: '', label: '' }}
          buttonClassName={iconButtonStyle}
          entries={[
            {
              value: 'username',
              label: (
                <>
                  <Flex
                    align={'center'}
                    grow={1}
                    className={css({
                      borderBottom: '1px solid var(--secondary-main)',
                      padding: space_sm,
                    })}
                  >
                    <Icon icon={'person'} />{' '}
                    {currentUser.firstname && currentUser.lastname
                      ? currentUser.firstname + ' ' + currentUser.lastname
                      : currentUser.username}
                  </Flex>
                </>
              ),
              disabled: true,
            },
            {
              value: 'settings',
              label: (
                <>
                  <Icon icon={'settings'} /> {i18n.user.settings}
                </>
              ),
              action: () => navigate('./settings'),
            },
            ...(currentUser.admin
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
            {
              value: 'language',
              label: (
                <>
                  <LanguageSelector />
                </>
              ),
              subDropDownButton: true,
            },
            {
              value: 'projects',
              label: (
                <>
                  <Icon icon={'home'} /> {i18n.common.projectsList}
                </>
              ),
              action: () => {
                dispatch(API.closeCurrentProject()).then(() => {
                  navigate('/');
                });
              },
            },
            {
              value: 'about',
              label: (
                <>
                  <Icon icon={'info'} /> {i18n.common.about}
                </>
              ),
              action: () => navigate('/about-colab'),
            },
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
        />
        {passwordScore != null && passwordScore.score < 2 && (
          <Icon title={i18n.authentication.error.yourPasswordIsWeak} icon={'warning'} />
        )}
      </div>
    );
  } else return <InlineLoading />;
}
