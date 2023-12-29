/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { User } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { LabeledInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  if (user) {
    return (
      <Flex direction="column">
        <h3>{i18n.user.userProfile}</h3>
        <LabeledInput
          value={user.username}
          label={i18n.user.model.username}
          readOnly
          onChange={() => {
            /* never change the username */
          }}
        />
        <LabeledInput
          label={i18n.user.model.firstname}
          value={user.firstname ?? ''}
          onChange={newValue => dispatch(API.updateUser({ ...user, firstname: newValue }))}
        />
        <LabeledInput
          label={i18n.user.model.lastname}
          value={user.lastname ?? ''}
          onChange={newValue => dispatch(API.updateUser({ ...user, lastname: newValue }))}
        />
        <LabeledInput
          label={i18n.user.model.affiliation}
          value={user.affiliation ?? ''}
          onChange={newValue => dispatch(API.updateUser({ ...user, affiliation: newValue }))}
        />
      </Flex>
    );
  } else {
    return (
      <div>
        <i>{i18n.user.noUserSelected}</i>
      </div>
    );
  }
}
