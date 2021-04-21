/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { getAllUsers } from '../../API/api';
import InlineLoading from '../common/InlineLoading';
import UserList from './UserList';

export default (): JSX.Element => {
  const dispatch = useAppDispatch();

  const status = useAppSelector(state => state.admin.userStatus);

  const users = useAppSelector(state => {
    // common sense would use a "filter(u => u != null)"
    // but resulting list will be typed (User | null)[]
    return Object.values(state.users.users).flatMap(user => (user != null ? [user] : []));
  });

  const title = <h3>Users</h3>;

  if (status === 'NOT_INITIALIZED') {
    dispatch(getAllUsers());
  }

  return (
    <div>
      {title}
      <div>{status !== 'INITIALIZED' ? <InlineLoading /> : <UserList users={users} />}</div>
    </div>
  );
};
