/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { User } from 'colab-rest-client';
import React from 'react';
import { br_full, space_lg, space_xs } from '../../../styling/style';
import Flex from '../layout/Flex';

const avatarStyle = cx(
  br_full,
  css({
    background: 'var(--transparent)',
    padding: space_xs,
    border: '1px solid var(--text-secondary)',
    color: 'var(--text-secondary)',
    textTransform: 'capitalize',
    minWidth: space_lg,
    userSelect: 'none',
    '&:hover': {
      border: '1px solid var(--text-primary)',
      color: 'var(--text-primary)',
    },
  }),
);

interface AvatarProps {
  currentUser: User;
}

export default function Avatar({ currentUser }: AvatarProps): JSX.Element {
  const fullName =
    currentUser.firstname && currentUser.lastname
      ? { first: currentUser.firstname, last: currentUser.lastname }
      : undefined;
  const uncompleteName =
    currentUser.commonname ||
    currentUser.lastname ||
    currentUser.firstname ||
    currentUser.username ||
    '?';
  const letters = fullName
    ? `${fullName.first[0]}${fullName.last[0]}`.toUpperCase()
    : uncompleteName.slice(0, 2);

  return (
    <Flex
      justify="center"
      align="center"
      className={avatarStyle}
      title={fullName ? `${fullName.first}${fullName.last}` : uncompleteName}
    >
      {letters}
    </Flex>
  );
}
