/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { User } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useUserSession } from '../../selectors/userSelector';
import { useAppDispatch } from '../../store/hooks';
import { categoryTabStyle } from '../common/collection/FilterableList';
import Button from '../common/element/Button';
import InlineLoading from '../common/element/InlineLoading';
import { space_sm } from '../styling/style';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const sessions = useUserSession(user?.id);

  if (user) {
    if (sessions != 'LOADING') {
      return (
        <div>
          <h3>{i18n.user.activeSessions}</h3>
          <div>
            {sessions.map(s => {
              return (
                <div key={s.id} title={s.userAgent || ''}>
                  <span>
                    #{s.id} ({i18n.common.datetime(s.lastSeen)})
                  </span>
                  {s.userAgent != navigator.userAgent ? (
                    <Button icon={'delete'} onClick={() => dispatch(API.forceLogout(s))} />
                  ) : (
                    <div
                      className={cx(
                        categoryTabStyle,
                        css({ display: 'inline-block', marginLeft: space_sm }),
                      )}
                    >
                      {i18n.user.current}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      return <InlineLoading />;
    }
  } else {
    return (
      <div>
        <i>{i18n.user.noUserSelected}</i>
      </div>
    );
  }
}
