/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { entityIs, ProjectContentChannel, UserChannel } from 'colab-rest-client';
import * as React from 'react';
import { getAllUsers, getOccupiedChannels } from '../../API/api';
import { useProject } from '../../selectors/projectSelector';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import { defaultThumbnailStyle } from '../common/collection/ItemThumbnailsSelection';
import IconButton from '../common/element/IconButton';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import { ProjectDisplay } from '../projects/ProjectList';
import { space_M } from '../styling/style';
import UserList from './UserList';

interface ProjectDisplayProps {
  projectId: number;
}
const projectThumbnailStyle = cx(defaultThumbnailStyle, css({ padding: 0 }));

function ProjectDisplayWrapper({ projectId }: ProjectDisplayProps) {
  const { project } = useProject(projectId);
  if (entityIs(project, 'Project')) {
    return (
      <div className={projectThumbnailStyle}>
        <ProjectDisplay project={project} />
      </div>
    );
  }
  return <InlineLoading />;
}

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
    const { userChannels, projectChannels } = Object.entries(channels).reduce<{
      userChannels: { channel: UserChannel; count: number }[];
      projectChannels: { channel: ProjectContentChannel; count: number }[];
    }>(
      (acc, [channelUrn, count]) => {
        const match = /urn:coLAB:\/WebsocketChannel\/(.*)\/(\d+)/.exec(channelUrn);
        if (match) {
          const atClass = match[1];
          const id = match[2];
          if (atClass === 'UserChannel' && id != null) {
            acc.userChannels.push({
              channel: {
                '@class': atClass,
                userId: +id,
              },
              count: count,
            });
          } else if (atClass === 'ProjectContentChannel' && id != null) {
            acc.projectChannels.push({
              channel: {
                '@class': atClass,
                projectId: +id,
              },
              count: count,
            });
          }
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
        if (entityIs(u, 'User')) {
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
          title="Sync"
        />

        <div>
          <UserList users={onlineUsers} />
        </div>
        <h3>Opened Projects</h3>
        <Flex gap={space_M} wrap="wrap">
          {projectChannels.map(overview => (
            <ProjectDisplayWrapper
              key={`channel-project-${overview.channel.projectId}`}
              projectId={overview.channel.projectId!}
            />
          ))}
        </Flex>
      </div>
    );
  }
}
