/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faSync } from '@fortawesome/free-solid-svg-icons';
import { entityIs, ProjectContentChannel, UserChannel } from 'colab-rest-client';
import * as React from 'react';
import { getAllUsers, getOccupiedChannels } from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import UserList from './UserList';

export default function Who(): JSX.Element {
  const dispatch = useAppDispatch();

  const channels = useAppSelector(state => state.admin.occupiedChannels, shallowEqual);

  const usersStatus = useAppSelector(state => state.admin.userStatus);

  const users = useAppSelector(state => state.users.users, shallowEqual);

  React.useEffect(() => {
    if (usersStatus === 'NOT_INITIALIZED') {
      dispatch(getAllUsers());
    }
  }, [usersStatus, dispatch]);

  React.useEffect(() => {
    if (channels === 'NOT_INITIALIZED') {
      dispatch(getOccupiedChannels());
    }
  }, [channels, dispatch]);

  if (channels === 'LOADING' || channels === 'NOT_INITIALIZED') {
    return (
      <div>
        <h3>Online Users</h3>
        <InlineLoading />
      </div>
    );
  } else {
    const { userChannels, projectChannels } = channels.reduce<{
      userChannels: { channel: UserChannel; count: number }[];
      projectChannels: { channel: ProjectContentChannel; count: number }[];
    }>(
      (acc, current) => {
        if (entityIs(current.channel, 'UserChannel')) {
          acc.userChannels.push({ channel: current.channel, count: current.count });
        } else if (entityIs(current.channel, 'ProjectContentChannel')) {
          acc.projectChannels.push({ channel: current.channel, count: current.count });
        }
        return acc;
      },
      {
        userChannels: [],
        projectChannels: [],
      },
    );

    const onlineUsers = userChannels.flatMap(overview => {
      if (overview.channel.userId != null) {
        const u = users[overview.channel.userId];
        if (u != null) {
          return [u];
        }
      }
      return [];
    });

    return (
      <div>
        <h3>Online Users</h3>
        <IconButton
          onClick={() => {
            dispatch(getOccupiedChannels());
          }}
          icon={faSync}
        />

        <div>
          <UserList users={onlineUsers} />
        </div>
        <h3>Opened Projects</h3>
        <div>
          {projectChannels.map(overview => (
            <div key={`channel-project-${overview.channel.projectId}`}>
              {overview.channel.projectId}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
