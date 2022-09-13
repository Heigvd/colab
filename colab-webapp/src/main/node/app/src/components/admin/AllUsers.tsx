/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import { getAllUsers } from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/element/InlineLoading';
import UserList from './UserList';

export default function AllUsers(): JSX.Element {
  const dispatch = useAppDispatch();

  const status = useAppSelector(state => state.admin.userStatus);

  const users = useAppSelector(state => {
    // common sense would use a "filter(u => u != null)"
    // but resulting list will be typed (User | 'LOADING')[]
    return Object.values(state.users.users).flatMap(user => (entityIs(user, 'User') ? [user] : []));
  }, shallowEqual);

  const title = <h3>Users</h3>;

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      dispatch(getAllUsers());
    }
  }, [status, dispatch]);

  return (
    <div>
      {title}
      <div>{status !== 'READY' ? <InlineLoading /> : <UserList users={users} />}</div>
    </div>
  );
}
