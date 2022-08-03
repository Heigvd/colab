/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { User } from 'colab-rest-client';
import * as React from 'react';
import { updateUser } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Form, { Field } from '../common/Form/Form';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const fields: Field<User>[] = [
    {
      key: 'username',
      label: i18n.user.model.username,
      type: 'text',
      isMandatory: false,
      readOnly: true,
    },
    {
      key: 'commonname',
      label: i18n.user.model.commonName,
      type: 'text',
      isMandatory: false,
    },
    {
      key: 'firstname',
      label: i18n.user.model.firstname,
      type: 'text',
      isMandatory: false,
    },
    {
      key: 'lastname',
      label: i18n.user.model.lastname,
      type: 'text',
      isMandatory: false,
    },
    {
      key: 'affiliation',
      label: i18n.user.model.affiliation,
      type: 'text',
      isMandatory: false,
    },
  ];

  if (user) {
    return (
      <div>
        <h3>User Profile</h3>
        <div>
          <Form
            fields={fields}
            value={user}
            onSubmit={u => {
              dispatch(updateUser(u));
            }}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <i>No user selected</i>
      </div>
    );
  }
}
