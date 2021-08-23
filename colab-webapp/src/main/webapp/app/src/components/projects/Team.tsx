/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { faCheck, faPaperPlane, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { HierarchicalPosition, Project, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import * as API from '../../API/api';
import { getDisplayName } from '../../helper';
import { useProjectTeam } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Destroyer } from '../common/Destroyer';
import IconButton from '../common/IconButton';
import InlineInput from '../common/InlineInput';
import InlineLoading from '../common/InlineLoading';
import OpenClose from '../common/OpenClose';
import WithToolbar from '../common/WithToolbar';
import { linkStyle } from '../styling/style';

const gridNewLine = css({
  gridColumnStart: 1,
});

function prettyPrint(position: HierarchicalPosition) {
  switch (position) {
    case 'OWNER':
      return 'Owner';
    case 'LEAD':
      return 'Project leader';
    case 'INTERN':
      return 'Intern';
    case 'EXTERN':
      return 'Extern';
  }
}

function buildOption(position: HierarchicalPosition) {
  return {
    value: position,
    label: prettyPrint(position),
  };
}

const options = [
  buildOption('OWNER'),
  buildOption('LEAD'),
  buildOption('INTERN'),
  buildOption('EXTERN'),
];

export function PositionSelector({
  value,
  onChange,
}: {
  value: HierarchicalPosition;
  onChange: (value: HierarchicalPosition) => void;
}): JSX.Element {
  const onChangeCb = React.useCallback(
    (option: { value: HierarchicalPosition } | null) => {
      if (option != null) {
        onChange(option.value);
      }
    },
    [onChange],
  );
  const currentValue = buildOption(value);

  return (
    <Select
      className={css({ minWidth: '160px' })}
      options={options}
      value={currentValue}
      onChange={onChangeCb}
    />
  );
}

export interface MemberProps {
  member: TeamMember;
  roles: TeamRole[];
}

const Member = ({ member, roles }: MemberProps) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => {
    if (member.userId != null) {
      return state.users.users[member.userId];
    } else {
      // no user id looks like a pending invitation
      return null;
    }
  });

  React.useEffect(() => {
    if (member.userId != null && user === undefined) {
      // member is linked to a user. This user is not yet known
      // load it
      dispatch(API.getUser(member.userId));
    }
  }, [member.userId, user, dispatch]);

  let username = <>"n/a"</>;

  if (member.userId == null) {
    username = <li>Invitation is pending...</li>;
  } else if (user == null) {
    username = <InlineLoading />;
  } else {
    username = <>{getDisplayName(user)}</>;
  }

  const roleIds = member.roleIds || [];
  return (
    <>
      <div className={gridNewLine}>{username}</div>
      <PositionSelector
        value={member.position}
        onChange={newPosition => {
          dispatch(API.setMemberPosition({ memberId: member.id!, position: newPosition }));
        }}
      />
      {roles.map(role => {
        const hasRole = roleIds.indexOf(role.id || -1) >= 0;
        return (
          <IconButton
            key={role.id}
            icon={hasRole ? faCheck : faTimes}
            onClick={() => {
              if (hasRole) {
                dispatch(API.removeRole({ roleId: role.id!, memberId: member.id! }));
              } else {
                dispatch(API.giveRole({ roleId: role.id!, memberId: member.id! }));
              }
            }}
          />
        );
      })}
    </>
  );
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
                    '@class': 'TeamRole',
                    projectId: project.id,
                    memberIds: [],
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
  role: TeamRole;
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

export default function Team({ project }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const projectId = project.id;

  const { members, roles, status } = useProjectTeam(projectId);

  const [invite, setInvite] = React.useState('');

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      // Load team members from server
      if (project.id != null) {
        dispatch(API.getProjectTeam(project.id));
      }
    }
  }, [projectId, status, dispatch, project.id]);

  const title = <h3>Team</h3>;

  if (status === 'INITIALIZED') {
    return (
      <div>
        {title}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: `repeat(${roles.length + 3}, max-content)`,
            '& > div': {
              marginLeft: '5px',
              marginRight: '5px',
            },
          })}
        >
          <div />
          <div />
          {roles.map(role => (
            <div key={'role-' + role.id}>
              <RoleDisplay role={role} />
            </div>
          ))}
          <div className={css({})}>
            <CreateRole project={project} />
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
                  projectId: project.id!,
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
}
