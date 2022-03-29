/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faCheck,
  faHourglassHalf,
  faPaperPlane,
  faPen,
  faPlus,
  faSave,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HierarchicalPosition, Project, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import * as API from '../../API/api';
import { getDisplayName } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProjectTeam } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Destroyer } from '../common/Destroyer';
import IconButton from '../common/IconButton';
import InlineInput from '../common/InlineInput';
import InlineLoading from '../common/InlineLoading';
import OpenClose from '../common/OpenClose';
import WithToolbar from '../common/WithToolbar';
import {
  errorColor,
  inputStyle,
  lightIconButtonStyle,
  lightItalicText,
  linkStyle,
  space_L,
  space_M,
  space_S,
  successColor,
  textSmall,
} from '../styling/style';

const gridNewLine = css({
  gridColumnStart: 1,
  justifySelf: 'start',
});

function prettyPrint(position: HierarchicalPosition) {
  switch (position) {
    case 'OWNER':
      return 'Owner';
    case 'LEADER':
      return 'Project leader';
    case 'INTERNAL':
      return 'Member';
    case 'GUEST':
      return 'Guest';
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
  buildOption('LEADER'),
  buildOption('INTERNAL'),
  buildOption('GUEST'),
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
  const i18n = useTranslations();

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

  const updateDisplayName = React.useCallback(
    (displayName: string) => {
      dispatch(API.updateMember({ ...member, displayName: displayName }));
    },
    [dispatch, member],
  );

  /*
  IS IT USEFUL?
  const clearDisplayName = React.useCallback(() => {
    dispatch(API.updateMember({ ...member, displayName: '' }));
  }, [dispatch, member]); */

  let username = <>"n/a"</>;

  if (member.displayName && member.userId != null) {
    // effective user with custom displayName
    // DN can be edited or cleared
    username = (
      <>
        <InlineInput
          placeholder="username"
          value={member.displayName || ''}
          onChange={updateDisplayName}
          autosave={false}
        />
        {/*  Is it useful? <IconButton icon={faEraser} title="Clear" onClick={clearDisplayName} /> */}
      </>
    );
  } else if (member.displayName && member.userId == null) {
    // display name with DN but no user depict a pending invitation
    // display name is not editable until user accept invitation
    username = (
      <span>
        <div className={cx(textSmall, lightItalicText)}>
          <FontAwesomeIcon icon={faHourglassHalf} className={css({ marginRight: space_S })} />
          {i18n.pendingInvitation}...
        </div>
        {member.displayName}
      </span>
    );
  } else if (member.userId == null) {
    // no user, no dn
    username = <span>{i18n.pendingInvitation}</span>;
  } else if (user == null) {
    username = <InlineLoading />;
  } else {
    const cn = getDisplayName(user);
    username = (
      <>
        {cn}
        {user.affiliation ? ` (${user.affiliation})` : ''}
        <IconButton icon={faPen} title="Edit" onClick={() => updateDisplayName(cn)} />
      </>
    );
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
            iconColor={hasRole ? successColor : errorColor}
            title={hasRole ? 'Remove role' : 'Give role'}
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
    <OpenClose
      showCloseIcon="NONE"
      collapsedChildren={
        <IconButton title="Add role" icon={faPlus} className={lightIconButtonStyle} />
      }
    >
      {collapse => (
        <>
          <input onChange={onChange} value={name} />
          <IconButton
            className={linkStyle}
            icon={faSave}
            title="Save"
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
          <IconButton icon={faTimes} title="Save" onClick={collapse} />
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
      <InlineInput value={role.name || ''} onChange={saveCb} placeholder="role" />
    </WithToolbar>
  );
};

export interface Props {
  project: Project;
}

export default function Team({ project }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projectId = project.id;

  const { members, roles, status } = useAndLoadProjectTeam(projectId);

  const [invite, setInvite] = React.useState('');

  const title = <h1>Team</h1>;

  if (status === 'INITIALIZED') {
    return (
      <div>
        <IconButton
          icon={faArrowLeft}
          title={'Back to project'}
          iconColor="var(--darkGray)"
          onClick={() => navigate('../')}
          className={css({ display: 'block', marginBottom: space_M })}
        />

        {title}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: `repeat(${roles.length + 3}, max-content)`,
            justifyItems: 'center',
            alignItems: 'center',
            '& > div': {
              marginLeft: '5px',
              marginRight: '5px',
            },
            marginBottom: space_L,
            paddingBottom: space_M,
            borderBottom: '1px solid var(--lightGray)',
            gap: space_S,
          })}
        >
          <div />
          <div />
          {roles.map(role => (
            <div key={'role-' + role.id}>
              <RoleDisplay role={role} />
            </div>
          ))}
          <div>
            <CreateRole project={project} />
          </div>
          {members.map(member => (
            <Member key={member.id} member={member} roles={roles} />
          ))}
        </div>
        <div>
          <p className={textSmall}>Invite new members</p>
          <input
            placeholder="email"
            type="text"
            onChange={e => setInvite(e.target.value)}
            value={invite}
            className={inputStyle}
          />
          {/* <Input onChange={e => setInvite(e)} value={invite} /> */}
          <IconButton
            className={linkStyle}
            icon={faPaperPlane}
            title="Send"
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
