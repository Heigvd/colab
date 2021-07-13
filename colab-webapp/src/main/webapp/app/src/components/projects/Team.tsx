/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { Project, Role, TeamMember } from 'colab-rest-client';
import InlineLoading from '../common/InlineLoading';
import * as API from '../../API/api';
import { getDisplayName } from '../../helper';
import { faCheck, faPaperPlane, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { linkStyle } from '../styling/style';
import IconButton from '../common/IconButton';
import { useProjectTeam } from '../../selectors/projectSelector';
import OpenClose from '../common/OpenClose';
import WithToolbar from '../common/WithToolbar';
import { Destroyer } from '../common/Destroyer';
import { css } from '@emotion/css';
import InlineInput from '../common/InlineInput';

const gridNewLine = css({
  gridColumnStart: 1,
});

export interface MemberProps {
  member: TeamMember;
  roles: Role[];
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

  React.useEffect(() => {
    if (props.member.userId != null && user === undefined) {
      // member is linked to a user. This user is not yet known
      // load it
      dispatch(API.getUser(props.member.userId));
    }
  }, [props.member.userId, user, dispatch]);

  if (props.member.userId == null) {
    return <li>Invitation is pending...</li>;
  } else if (user == null) {
    return (
      <div className={gridNewLine}>
        <InlineLoading />
      </div>
    );
  } else {
    const roles = props.member.roleIds || [];
    return (
      <>
        <div className={gridNewLine}>{getDisplayName(user)}</div>
        {props.roles.map(role => {
          const hasRole = roles.indexOf(role.id || -1) >= 0;
          return (
            <IconButton
              key={role.id}
              icon={hasRole ? faCheck : faTimes}
              onClick={() => {
                if (hasRole) {
                  dispatch(API.removeRole({ roleId: role.id!, memberId: props.member.id! }));
                } else {
                  dispatch(API.giveRole({ roleId: role.id!, memberId: props.member.id! }));
                }
              }}
            />
          );
        })}
      </>
    );
  }
};

function CreateRole({ project }: { project: Project }): JSX.Element {
  const dispatch = useAppDispatch();
  const [name, setName] = React.useState('');

  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  return (
    <OpenClose collaspedChildren={<IconButton icon={faPlus} />}>
      {collapse => (
        <>
          <input onChange={onChange} value={name} />
          <IconButton
            className={linkStyle}
            icon={faSave}
            onClick={() =>
              dispatch(
                API.createRole({
                  project: project,
                  role: {
                    '@class': 'Role',
                    projectId: project.id,
                    name: name,
                  },
                }),
              ).then(() => {
                setName('');
                collapse();
              })
            }
          />
        </>
      )}
    </OpenClose>
  );
}

export interface RoleProps {
  role: Role;
}

const RoleDisplay = ({ role }: RoleProps) => {
  const dispatch = useAppDispatch();

  const saveCb = React.useCallback(
    (value: string) => {
      dispatch(API.updateRole({ ...role, name: value }));
    },
    [role, dispatch],
  );

  const deleteCb = React.useCallback(() => {
    if (role.id != null) {
      dispatch(API.deleteRole(role.id));
    }
  }, [role, dispatch]);

  return (
    <WithToolbar
      toolbarPosition="TOP_LEFT"
      toolbar={
        <>
          <Destroyer onDelete={deleteCb} />
        </>
      }
    >
      <InlineInput value={role.name || ''} onChange={saveCb} />
    </WithToolbar>
  );
};

export interface Props {
  project: Project;
}

export default (props: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const projectId = props.project.id;

  const { members, roles, status } = useProjectTeam(projectId);

  const [invite, setInvite] = React.useState('');

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      // Load team members from server
      if (props.project.id != null) {
        dispatch(API.getProjectTeam(props.project.id));
      }
    }
  }, [projectId, status, dispatch, props.project.id]);

  const title = <h3>Team</h3>;

  if (status === 'INITIALIZED') {
    return (
      <div>
        {title}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: `repeat(${roles.length + 2}, max-content)`,
            '& > div': {
              marginLeft: '5px',
              marginRight: '5px',
            },
          })}
        >
          <div />
          {roles.map(role => (
            <div key={'role-' + role.id}>
              <RoleDisplay role={role} />
            </div>
          ))}
          <div className={css({})}>
            <CreateRole project={props.project} />
          </div>
          {members.map(member => (
            <Member key={member.id} member={member} roles={roles} />
          ))}
        </div>

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
                API.sendInvitation({
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
