/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { User } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useUserSession } from '../../selectors/userSelector';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import InlineLoading from '../common/InlineLoading';

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
          <h3>Active Sessions</h3>
          <div>
            {sessions.map(s => {
              return (
                <div key={s.id} title={s.userAgent || ''}>
                  <span>
                    #{s.id} ({i18n.common.datetime(s.lastSeen)})
                  </span>
                  <Button icon={faTrash} onClick={() => dispatch(API.forceLogout(s))} />
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
        <i>No user selected</i>
      </div>
    );
  }
}
