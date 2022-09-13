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
  faSkullCrossbones,
  faTimes,
  faTrash,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HierarchicalPosition, Project, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import * as API from '../../API/api';
import { emailFormat, getDisplayName } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProjectTeam } from '../../selectors/projectSelector';
import { useCurrentUser } from '../../selectors/userSelector';
import { useAppDispatch, useAppSelector, useLoadingState } from '../../store/hooks';
import { addNotification } from '../../store/notification';
import { Destroyer } from '../common/Destroyer';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import IconButtonWithLoader from '../common/element/IconButtonWithLoader';
import InlineLoading from '../common/element/InlineLoading';
import { DiscreetInput, InlineInput } from '../common/element/Input';
import ConfirmDeleteModal from '../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import OpenClose from '../common/layout/OpenClose';
import OpenCloseModal from '../common/layout/OpenCloseModal';
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

export function PositionSelector({
  value,
  onChange,
  isMyRights,
}: {
  value: HierarchicalPosition;
  onChange: (value: HierarchicalPosition) => void;
  isMyRights: boolean;
}): JSX.Element {
  const i18n = useTranslations();
  const [open, setOpen] = React.useState<boolean>(false);
  const onChangeCb = React.useCallback(
    (option: { value: HierarchicalPosition } | null) => {
      if (option != null) {
        onChange(option.value);
        setOpen(false);
      }
    },
    [onChange],
  );
  function prettyPrint(position: HierarchicalPosition) {
    switch (position) {
      case 'OWNER':
        return i18n.team.rolesNames.owner;
      case 'LEADER':
        return i18n.team.rolesNames.projectLeader;
      case 'INTERNAL':
        return i18n.team.rolesNames.member;
      case 'GUEST':
        return i18n.team.rolesNames.guest;
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
  const currentValue = buildOption(value);

  return (
    <div>
      {isMyRights && (
        <OpenCloseModal
          title={i18n.team.changeOwnRights}
          collapsedChildren={<></>}
          status={open ? 'EXPANDED' : 'COLLAPSED'}
        >
          {collapse => (
            <Flex direction="column" align="stretch" grow={1}>
              <Flex grow={1} direction="column">
                {i18n.team.sureChangeOwnRights}
              </Flex>
              <Flex justify="flex-end">
                <Button
                  title={i18n.common.cancel}
                  onClick={() => {
                    collapse();
                    setOpen(false);
                  }}
                  invertedButton
                >
                  {i18n.common.cancel}
                </Button>
                <Button
                  title={i18n.common.change}
                  onClick={() => {
                    collapse();
                  }}
                  className={css({
                    backgroundColor: errorColor,
                    marginLeft: space_M,
                  })}
                >
                  {i18n.common.change}
                </Button>
              </Flex>
            </Flex>
          )}
        </OpenCloseModal>
      )}
      <Select
        className={css({ minWidth: '160px' })}
        options={options}
        value={currentValue}
        onChange={onChangeCb}
        onMenuOpen={() => setOpen(true)}
      />
    </div>
  );
}

export interface MemberProps {
  member: TeamMember;
  roles: TeamRole[];
  isTheOnlyOwner: boolean;
}

const Member = ({ member, roles, isTheOnlyOwner }: MemberProps) => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const { currentUser, status: currentUserStatus } = useCurrentUser();
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  //const [ open, setOpen ] = React.useState<'COLLAPSED' | 'EXPANDED'>('COLLAPSED');

  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

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

  const changeRights = React.useCallback(
    (newPosition: HierarchicalPosition) => {
      if (isTheOnlyOwner) {
        dispatch(
          addNotification({
            status: 'OPEN',
            type: 'WARN',
            message: i18n.team.oneOwnerPerProject,
          }),
        );
      } else {
        dispatch(API.setMemberPosition({ memberId: member.id!, position: newPosition }));
      }
    },
    [dispatch, i18n.team.oneOwnerPerProject, isTheOnlyOwner, member.id],
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
        {/* TODO: Can edit only our name if not owner or PL. */}
        <DiscreetInput
          value={member.displayName || ''}
          placeholder={i18n.authentication.field.username}
          onChange={updateDisplayName}
        />
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
  } else if (user == 'LOADING' || user == null) {
    username = <InlineLoading />;
  } else if (user == 'ERROR') {
    username = <FontAwesomeIcon icon={faSkullCrossbones} />;
  } else {
    const cn = getDisplayName(user);
    username = (
      <>
        {cn}
        {user.affiliation ? ` (${user.affiliation})` : ''}
        <IconButton icon={faPen} title={i18n.common.edit} onClick={() => updateDisplayName(cn)} />
      </>
    );
  }

  const roleIds = member.roleIds || [];
  return (
    <>
      <div className={gridNewLine}>{username}</div>
      {currentUser?.id != member.userId ? (
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
          entries={[
            {
              value: 'delete',
              label: (
                <ConfirmDeleteModal
                  buttonLabel={
                    <div className={cx(css({ color: errorColor }), modalEntryStyle)}>
                      <FontAwesomeIcon icon={faTrash} /> {i18n.common.delete}
                    </div>
                  }
                  className={css({
                    '&:hover': { textDecoration: 'none' },
                    display: 'flex',
                    alignItems: 'center',
                  })}
                  message={
                    <p>
                      {i18n.team.sureDeleteMember}
                    </p>
                  }
                  onConfirm={() => {
                    startLoading();
                    dispatch(API.deleteMember(member)).then(stopLoading);
                  }}
                  confirmButtonLabel={i18n.team.deleteMember}
                  isConfirmButtonLoading={isLoading}
                />
              ),
              modal: true,
            },
          ]}
        />
      ) : (
        <FontAwesomeIcon icon={faUser} title={i18n.team.me} />
      )}
      {/*       <OpenCloseModal
        title="Change your own rightd"
        collapsedChildren={<></>}
        status={open}
        >
        {() => <div>Are you sure you want to change your own rights? </div>}
        
      </OpenCloseModal> */}
      <PositionSelector
        value={member.position}
        onChange={newPosition => changeRights(newPosition)}
        isMyRights={currentUser?.id === member.userId}
      />
      {roles.map(role => {
        const hasRole = roleIds.indexOf(role.id || -1) >= 0;
        return (
          <IconButton
            key={role.id}
            icon={hasRole ? faCheck : faTimes}
            iconColor={hasRole ? successColor : errorColor}
            title={hasRole ? i18n.team.removeRole : i18n.team.giveRole}
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
  const i18n = useTranslations();

  const [name, setName] = React.useState('');

  return (
    <OpenClose
      collapsedChildren={
        <IconButton
          title={i18n.modules.team.actions.createRole}
          icon={faPlus}
          className={lightIconButtonStyle}
        />
      }
    >
      {collapse => (
        <>
          <InlineInput
            value={name}
            placeholder={i18n.team.fillRoleName}
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
  const i18n = useTranslations();
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
      <DiscreetInput
        value={role.name || ''}
        placeholder={i18n.team.fillRoleName}
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
  const i18n = useTranslations();
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

  const isValidNewMember =
    invite.length > 0 && invite.match(emailFormat) != null && isNewMember(invite);
  const projectOwners = members.filter(m => m.position === 'OWNER');

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
            {i18n.team.members}
          </div>
          <div className={titleCellStyle}>{i18n.team.rights}</div>
          <div className={cx(titleCellStyle, css({ gridColumnStart: 4, gridColumnEnd: 'end' }))}>
            {i18n.team.roles}
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
          {members.map(member => {
            return (
              <Member
                key={member.id}
                member={member}
                roles={roles}
                isTheOnlyOwner={projectOwners.length < 2 && projectOwners.includes(member)}
              />
            );
          })}
        </div>
        <div>
          <p className={textSmall}>{i18n.team.inviteNewMember}</p>
          <input
            placeholder={i18n.authentication.field.emailAddress}
            type="text"
            onChange={e => setInvite(e.target.value)}
            value={invite}
            className={inputStyle}
          />
          <IconButtonWithLoader
            className={linkStyle}
            icon={faPaperPlane}
            title={i18n.common.send}
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
              } else if (!isNewMember(invite)) {
                setError(i18n.team.memberAlreadyExist);
              } else {
                setError(i18n.authentication.error.emailAddressNotValid);
              }
            }}
          />
          {error && <div className={cx(css({ color: warningColor }), textSmall)}>{error}</div>}
        </div>
      </>
    );
  } else {
    return (
      <div>
        <InlineLoading />
      </div>
    );
  }
}
