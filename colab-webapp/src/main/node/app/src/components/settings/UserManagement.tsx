/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { User } from 'colab-rest-client';
import * as React from 'react';
import { space_xl } from '../../styling/style';
import Flex from '../common/layout/Flex';
import AccountsList from './AccountsList';
import UserProfile from './UserProfile';

interface UserManagementProps {
  user: User;
}

export function UserManagement({ user }: UserManagementProps): JSX.Element {
  return (
    <Flex direction="row" align-self="center" className={css({ gap: space_xl })}>
      <UserProfile user={user} />
      <AccountsList user={user} />
    </Flex>
  );
}
