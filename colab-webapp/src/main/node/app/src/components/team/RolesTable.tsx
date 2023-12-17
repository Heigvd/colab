/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useCurrentProject } from '../../store/selectors/projectSelector';
import { useTeamMembers } from '../../store/selectors/teamMemberSelector';
import { useTeamRoles } from '../../store/selectors/teamRoleSelector';
import { useLoadUsersForCurrentProject } from '../../store/selectors/userSelector';
import {
  lightIconButtonStyle,
  p_0,
  p_2xs,
  team1stHeaderRowStyle,
  team2ndHeaderCellStyle as team2ndHeaderCellDefaultStyle,
  team2ndHeaderRowStyle,
  teamBodyRowStyle,
  teamPanelStyle,
  teamTableHeaderStyle,
  teamTableStyle,
  teamThStyle,
  userNameCellStyle,
} from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IconButton from '../common/element/IconButton';
import { DiscreetInput } from '../common/element/Input';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import Flex from '../common/layout/Flex';
import ShowOnClick from '../common/layout/ShowOnClick';
import UserName from './UserName';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Style

const team2ndHeaderCellStyle = cx(
  team2ndHeaderCellDefaultStyle,
  css({
    '&:hover button': {
      visibility: 'visible',
    },
  }),
);

const createRoleColumnStyle = css({
  justifySelf: 'start',
});

const roleInputStyle = cx(
  p_2xs,
  css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
);

const deleteActionButtonStyle = cx(
  p_0,
  css({
    visibility: 'hidden',
  }),
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel

export default function TeamRolesPanel(): JSX.Element {
  const i18n = useTranslations();

  const { status: statusMembers, members } = useTeamMembers();

  const { status: statusRoles, roles } = useTeamRoles();

  const statusUsers = useLoadUsersForCurrentProject();

  if (statusMembers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusMembers} />;
  }

  if (statusRoles !== 'READY') {
    return <AvailabilityStatusIndicator status={statusRoles} />;
  }

  if (statusUsers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusUsers} />;
  }

  return (
    <Flex className={teamPanelStyle}>
      <table className={teamTableStyle}>
        <thead className={teamTableHeaderStyle}>
          {/* titles header row */}
          <tr className={team1stHeaderRowStyle}>
            <th className={teamThStyle}>{i18n.team.members}</th>
            <th className={teamThStyle} colSpan={roles.length}>
              {i18n.team.roles}
            </th>
          </tr>
          {/* roles name header row */}
          <tr className={team2ndHeaderRowStyle}>
            <td />
            <RoleLabelColumns roles={roles} />
            <td className={createRoleColumnStyle}>
              <CreateRoleButton />
            </td>
          </tr>
        </thead>
        <tbody>
          {/* data rows : member -> role checks */}
          {members.map(member => {
            return <MemberWithRolesChecksRow key={member.id} member={member} roles={roles} />;
          })}
        </tbody>
      </table>
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Role list

interface RoleLabelColumns {
  roles: TeamRole[];
}

function RoleLabelColumns({ roles }: RoleLabelColumns): JSX.Element {
  return (
    <>
      {roles.map(role => (
        <td key={role.id} className={team2ndHeaderCellStyle}>
          <RoleLabel role={role} />
        </td>
      ))}
    </>
  );
}

interface RoleLabelProps {
  role: TeamRole;
}

function RoleLabel({ role }: RoleLabelProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

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
  const [showModal, setShowModal] = React.useState<'' | 'delete'>('');

  const resetState = React.useCallback(() => {
    setShowModal('');
  }, [setShowModal]);

  const showDeleteModal = React.useCallback(() => {
    setShowModal('delete');
  }, [setShowModal]);

  return (
    <Flex align="center">
      {showModal === 'delete' && (
        <ConfirmDeleteModal
          title={i18n.team.deleteRole}
          message={<p>{i18n.team.sureDeleteRole}</p>}
          onCancel={resetState}
          onConfirm={deleteCb}
        />
      )}
      <DiscreetInput
        value={role.name || ''}
        placeholder={i18n.team.fillRoleName}
        onChange={saveCb}
        maxWidth={'calc(100% - 20px)'}
        inputDisplayClassName={roleInputStyle}
      />
      <IconButton
        icon="delete"
        title={i18n.team.clickToRemoveRole}
        onClick={showDeleteModal}
        className={deleteActionButtonStyle}
        iconSize="xs"
      />
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Role creation action

function CreateRoleButton(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project } = useCurrentProject();

  const [name, setName] = React.useState<string>('');

  return (
    <ShowOnClick
      collapsedChildren={
        <IconButton
          title={i18n.team.actions.createRole}
          icon={'add'}
          iconSize="xs"
          className={cx(lightIconButtonStyle, p_0)}
        />
      }
    >
      {collapse =>
        project == null ? (
          <AvailabilityStatusIndicator status="ERROR" />
        ) : (
          <DiscreetInput
            value={name}
            placeholder={i18n.team.fillRoleName}
            onChange={newValue => {
              if (isRoleNameAcceptable(newValue)) {
                dispatch(
                  API.createRole({
                    project: project,
                    role: {
                      '@class': 'TeamRole',
                      projectId: project.id,
                      name: newValue,
                    },
                  }),
                ).then(() => {
                  setName('');
                  collapse();
                });
              } else {
                collapse();
              }
            }}
            onCancel={collapse}
          />
        )
      }
    </ShowOnClick>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper

function isRoleNameAcceptable(newValue: string): boolean {
  return newValue != null && newValue.trim().length > 0;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Row

interface MemberWithRolesChecksRowProps {
  member: TeamMember;
  roles: TeamRole[];
}

function MemberWithRolesChecksRow({ member, roles }: MemberWithRolesChecksRowProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  return (
    <tr className={teamBodyRowStyle}>
      <td className={userNameCellStyle}>
        <UserName member={member} />
      </td>
      {roles.map(role => {
        const hasRole = member.roleIds.indexOf(role.id!) >= 0;

        return (
          <td key={role.id}>
            <Flex justify="center" align="center" grow={1}>
              <IconButton
                icon={hasRole ? 'check' : 'remove'}
                iconColor={hasRole ? 'var(--green-400)' : 'var(--gray-400)'}
                iconSize={hasRole ? 'sm' : 'xs'}
                title={hasRole ? i18n.team.clickToRemoveRole : i18n.team.clickToGiveRole}
                onClick={() => {
                  if (hasRole) {
                    dispatch(API.removeRole({ roleId: role.id!, memberId: member.id! }));
                  } else {
                    dispatch(API.giveRole({ roleId: role.id!, memberId: member.id! }));
                  }
                }}
              />
            </Flex>
          </td>
        );
      })}
    </tr>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
