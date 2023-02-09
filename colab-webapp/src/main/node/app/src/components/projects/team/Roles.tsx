/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import {
  faCheck,
  faEllipsisV,
  faEnvelope,
  faHourglassHalf,
  faMinus,
  faPen,
  faPlus,
  faSkullCrossbones,
  faTrash,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Project, TeamMember, TeamRole } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import { getDisplayName } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import { useCurrentUser } from '../../../selectors/userSelector';
import { useAppDispatch, useAppSelector, useLoadingState } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import { Destroyer } from '../../common/Destroyer';
import IconButton from '../../common/element/IconButton';
import InlineLoading from '../../common/element/InlineLoading';
import { DiscreetInput, InlineInput } from '../../common/element/Input';
import Tips from '../../common/element/Tips';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../../common/layout/DropDownMenu';
import OpenClose from '../../common/layout/OpenClose';
import WithToolbar from '../../common/WithToolbar';
import {
  errorColor,
  lightIconButtonStyle,
  lightItalicText,
  lightText,
  space_L,
  space_M,
  space_S,
  successColor,
  textSmall,
} from '../../styling/style';
import { gridNewLine, titleCellStyle } from './Team';

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

export interface MemberWithProjectRoleProps {
  member: TeamMember;
  roles: TeamRole[];
}

const MemberWithProjectRole = ({ member, roles }: MemberWithProjectRoleProps) => {
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

  let username = <>"n/a"</>;

  if (member.displayName && member.userId != null) {
    username = (
      <>
        <DiscreetInput
          value={member.displayName || ''}
          placeholder={i18n.authentication.field.username}
          onChange={updateDisplayName}
        />
      </>
    );
  } else if (member.displayName && member.userId == null) {
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

  const [showModal, setShowModal] = React.useState('');

  const roleIds = member.roleIds || [];
  return (
    <>
      {showModal === 'delete' && (
        <ConfirmDeleteModal
          title={i18n.team.deleteMember}
          message={<p>{i18n.team.sureDeleteMember}</p>}
          onCancel={() => {
            setShowModal('');
          }}
          onConfirm={() => {
            startLoading();
            dispatch(API.deleteMember(member)).then(stopLoading);
          }}
          confirmButtonLabel={i18n.team.deleteMember}
          isConfirmButtonLoading={isLoading}
        />
      )}
      <div className={cx(gridNewLine, textSmall)}>{username}</div>
      {currentUser?.id != member.userId ? (
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
          onSelect={value => setShowModal(value.value)}
          entries={[
            ...(member.userId == null
              ? [
                  {
                    value: 'resend',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faEnvelope} />{' '}
                        {i18n.modules.team.actions.resendInvitation}
                      </>
                    ),
                    action: () => {
                      if (member.projectId && member.displayName) {
                        dispatch(
                          API.sendInvitation({
                            projectId: member.projectId,
                            recipient: member.displayName,
                          }),
                        ).then(() =>
                          dispatch(
                            addNotification({
                              status: 'OPEN',
                              type: 'INFO',
                              message: i18n.modules.team.actions.invitationResent,
                            }),
                          ),
                        );
                      }
                    },
                  },
                ]
              : []),
            {
              value: 'delete',
              label: (
                <>
                  <FontAwesomeIcon icon={faTrash} color={errorColor} /> {i18n.common.delete}
                </>
              ),
            },
          ]}
        />
      ) : (
        <FontAwesomeIcon icon={faUser} title={i18n.team.me} />
      )}
      {roles.map(role => {
        const hasRole = roleIds.indexOf(role.id || -1) >= 0;
        return (
          <IconButton
            key={role.id}
            icon={hasRole ? faCheck : faMinus}
            iconColor={hasRole ? successColor : 'var(--darkGray)'}
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

export default function TeamRoles({ project }: { project: Project }): JSX.Element {
  const i18n = useTranslations();
  const projectId = project.id;
  const { members, roles } = useAndLoadProjectTeam(projectId);
  return (
    <>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: `repeat(${roles.length + 2}, max-content)`,
          justifyItems: 'center',
          alignItems: 'flex-end',
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
        <div className={cx(titleCellStyle, css({ gridColumnStart: 3, gridColumnEnd: 'end' }))}>
          {i18n.team.roles}
          <Tips
            iconClassName={cx(textSmall, lightText)}
            className={cx(textSmall, css({ fontWeight: 'normal' }))}
          >
            {i18n.team.rolesHelper}
          </Tips>
        </div>
        <div />
        {/* <div /> */}
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
          return <MemberWithProjectRole key={member.id} member={member} roles={roles} />;
        })}
      </div>
    </>
  );
}
