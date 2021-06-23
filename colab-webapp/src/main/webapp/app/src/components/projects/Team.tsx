/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {Project, Role, TeamMember} from 'colab-rest-client';
import InlineLoading from '../common/InlineLoading';
import {getProjectRoles, getProjectTeam, getUser, sendInvitation} from '../../API/api';
import {getDisplayName} from '../../helper';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import {linkStyle} from '../styling/style';
import IconButton from '../common/IconButton';
import {useRoles, useTeamMembers} from '../../selectors/projectSelector';

export interface MemberProps {
  member: TeamMember;
}

const Member = (props: MemberProps) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => {
    if (props.member.userId != null) {
      return state.users.users[props.member.userId];
    } else {
      // no user id looks like a pending invitation
      return null;
    }
  });

  if (props.member.userId == null) {
    return <li>Invitation is pending...</li>;
  } else if (user == null) {
    if (props.member.userId && user === undefined) {
      dispatch(getUser(props.member.userId));
    }
    return (
      <li>
        <InlineLoading />
      </li>
    );
  } else {
    return <li>{getDisplayName(user)}</li>;
  }
};


export interface RoleProps {
  role: Role;
}

const RoleDisplay = (props: RoleProps) => {
  return <li>{props.role.name}</li>;
};

export interface Props {
  project: Project;
}

export default (props: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const projectId = props.project.id;

  const {members, status: memberStatus} = useTeamMembers(projectId);
  const {roles, status: roleStatus} = useRoles(projectId);

  const [invite, setInvite] = React.useState('');

  React.useEffect(() => {
    if (memberStatus === 'NOT_INITIALIZED') {
      // Load team members from server
      if (props.project.id != null) {
        dispatch(getProjectTeam(props.project.id));
      }
    }
  }, [projectId, memberStatus])

  React.useEffect(() => {
    if (roleStatus === 'NOT_INITIALIZED') {
      // Load team members from server
      if (props.project.id != null) {
        dispatch(getProjectRoles(props.project.id));
      }
    }
  }, [projectId, roleStatus])

  const title = <h3>Team</h3>;

  if (memberStatus === 'INITIALIZED' && roleStatus === 'INITIALIZED') {
    return (
      <div>
        {title}
        <h3>Roles</h3>
        <ul>
          {roles.map(role => (
            <RoleDisplay key={role.id} role={role} />
          ))}
        </ul>
        <h3>Members</h3>
        <ul>
          {members.map(member => (
            <Member key={member.id} member={member} />
          ))}
        </ul>
        <div>
          <label>
            Invite:
            <input type="text" onChange={e => setInvite(e.target.value)} value={invite} />
          </label>
          <IconButton
            className={linkStyle}
            icon={faPaperPlane}
            onClick={() =>
              dispatch(
                sendInvitation({
                  projectId: props.project.id!,
                  recipient: invite,
                }),
              ).then(() => setInvite(''))
            }
          />
        </div>
      </div>
    );
  } else {
    return (
      <div>
        {title}
        <InlineLoading />;
      </div>
    );
  }
};
