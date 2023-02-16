/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { User } from 'colab-rest-client';
import React from 'react';
import { br_full, space_xs } from '../../styling/style';
import Flex from '../layout/Flex';

const avatarStyle = cx(
  br_full,
  css({
    background: 'var(--transparent)',
    padding: space_xs,
    border: '1px solid var(--text-secondary)',
    color: 'var(--text-secondary)',
    '&:hover': {
        border: '1px solid var(--text-primary)',
    color: 'var(--text-primary)',
    }
  }),
);

interface AvatarProps {
  currentUser: User;
}

export default function Avatar({ currentUser }: AvatarProps): JSX.Element {


  //const displayName = (entityIs(currentUser, 'User') ? getDisplayName(currentUser) : '') || 'Anonymous';
const firstName = currentUser.firstname || 'A';
const lastName = currentUser.lastname || 'A';
const letters = `${firstName[0]}${lastName[0]}`;


  return (
    <Flex className={avatarStyle} title={firstName + ' ' + lastName}>
      {letters}
    </Flex>
  );
}
