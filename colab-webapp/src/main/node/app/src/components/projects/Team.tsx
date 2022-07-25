/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import {
  faCheck,
  faEllipsisV,
  faHourglassHalf,
  faPaperPlane,
  faPen,
  faPlus,
  faTimes,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HierarchicalPosition, Project, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import * as API from '../../API/api';
import { getDisplayName } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProjectTeam } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Destroyer } from '../common/Destroyer';
import IconButton from '../common/element/IconButton';
import IconButtonWithLoader from '../common/element/IconButtonWithLoader';
import InlineLoading from '../common/element/InlineLoading';
import { InlineInput } from '../common/element/Input';
import { emailFormat } from '../common/Form/Form';
import ConfirmDeleteModal from '../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../common/layout/DropDownMenu';
import OpenClose from '../common/layout/OpenClose';
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
  warningColor,
} from '../styling/style';

const gridNewLine = css({
  gridColumnStart: 1,
  justifySelf: 'start',
});
const titleCellStyle = css({
  justifySelf: 'stretch',
  padding: space_S + ' 0',
  fontWeight: 800,
  borderBottom: '1px solid var(--lightGray)',
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
          value={member.displayName || ''}
          placeholder="username"
          autoWidth
          saveMode="ON_CONFIRM"
          onChange={updateDisplayName}
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
          {i18n.authentication.info.pendingInvitation}...
        </div>
        {member.displayName}
      </span>
    );
  } else if (member.userId == null) {
    // no user, no dn
    username = <span>{i18n.authentication.info.pendingInvitation}</span>;
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
      <DropDownMenu
        icon={faEllipsisV}
        valueComp={{ value: '', label: '' }}
        buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
        entries={[
          {
            value: 'Delete team member',
            label: (
              <ConfirmDeleteModal
                buttonLabel={
                  <div className={cx(css({ color: errorColor }), modalEntryStyle)}>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </div>
                }
                className={css({
                  '&:hover': { textDecoration: 'none' },
                  display: 'flex',
                  alignItems: 'center',
                })}
                message={
                  <p>
                    Are you <strong>sure</strong> you want to delete this team member ?
                  </p>
                }
                onConfirm={() => {
                  dispatch(API.deleteMember(member));
                }}
                confirmButtonLabel={'Delete team member'}
              />
            ),
            modal: true,
          },
        ]}
      />
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

  return (
    <OpenClose
      collapsedChildren={
        <IconButton title="Add role" icon={faPlus} className={lightIconButtonStyle} />
      }
    >
      {collapse => (
        <>
          <InlineInput
            value={name}
            placeholder="Fill the role name"
            autoWidth
            saveMode="ON_CONFIRM"
            onChange={newValue =>
              dispatch(
                API.createRole({
                  project: project,
                  role: {
                    '@class': 'TeamRole',
                    projectId: project.id,
                    memberIds: [],
                    name: newValue,
                  },
                }),
              ).then(() => {
                setName('');
                collapse();
              })
            }
            onCancel={collapse}
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
      <InlineInput
        value={role.name || ''}
        placeholder="Fill the role name"
        saveMode="ON_CONFIRM"
        onChange={saveCb}
        maxWidth="150px"
      />
    </WithToolbar>
  );
};

export interface TeamProps {
  project: Project;
}

export default function Team({ project }: TeamProps): JSX.Element {
  const dispatch = useAppDispatch();
  const projectId = project.id;

  const { members, roles, status } = useAndLoadProjectTeam(projectId);

  const [invite, setInvite] = React.useState('');
  const [error, setError] = React.useState<boolean | string>(false);

  const isNewMember = (newMail: string) => {
    let isNew = true;
    members.forEach(m => {
      if (m.displayName === newMail) {
        isNew = false;
      }
    });
    return isNew;
  };

  const isValidNewMember = invite.length > 0 && invite.match(emailFormat) != null && isNewMember(invite);

  if (status === 'INITIALIZED') {
    return (
      <>
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
          <div className={cx(titleCellStyle, css({ gridColumnStart: 1, gridColumnEnd: 3 }))}>
            Members
          </div>
          <div className={titleCellStyle}>Rights</div>
          <div className={cx(titleCellStyle, css({ gridColumnStart: 4, gridColumnEnd: 'end' }))}>
            Roles
          </div>
          <div />
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
          <p className={textSmall}>Invite new member</p>
          <input
            placeholder="email"
            type="text"
            onChange={e => setInvite(e.target.value)}
            value={invite}
            className={inputStyle}
          />
          <IconButtonWithLoader
            className={linkStyle}
            icon={faPaperPlane}
            title="Send"
            isLoading={isValidNewMember}
            onClick={() => {
              if (isValidNewMember) {
                setError(false);
                dispatch(
                  API.sendInvitation({
                    projectId: project.id!,
                    recipient: invite,
                  }),
                ).then(() => setInvite(''));
              } else if(!isNewMember(invite)) {
                setError('Member with same email already in team');
              } else {
                setError('Not an email adress');
              }
            }}
          />
          {error && (
            <div className={cx(css({ color: warningColor }), textSmall)}>{error}</div>
          )}
        </div>
      </>
    );
  } else {
    return (
      <div>
        <InlineLoading />;
      </div>
    );
  }
}
