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
import { lightIconButtonStyle, p_0, p_2xs, text_sm, th_sm } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IconButton from '../common/element/IconButton';
import { DiscreetInput } from '../common/element/Input';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import Flex from '../common/layout/Flex';
import OpenClose from '../common/layout/OpenClose';
import UserName from './UserName';

////////////////////////////////////////////////////////////////////////////////////////////////////

function isRoleNameAcceptable(newValue: string): boolean {
  return newValue != null && newValue.trim().length > 0;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export interface RoleLabelProps {
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
        inputDisplayClassName={cx(p_2xs, css({ overflow: 'hidden', textOverflow: 'ellipsis' }))}
      />
      <IconButton
        icon="delete"
        title={i18n.team.clickToRemoveRole}
        onClick={showDeleteModal}
        className={cx(p_0, css({ visibility: 'hidden' }))}
        iconSize="xs"
      />
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

function CreateRoleButton(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project } = useCurrentProject();

  const [name, setName] = React.useState<string>('');

  return (
    <OpenClose
      collapsedChildren={
        <IconButton
          title={i18n.team.actions.createRole}
          icon={'add'}
          className={lightIconButtonStyle}
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
    </OpenClose>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export interface MemberWithRolesChecksRowProps {
  member: TeamMember;
  roles: TeamRole[];
}

function MemberWithRolesChecksRow({ member, roles }: MemberWithRolesChecksRowProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  return (
    <tr>
      <td className={cx(text_sm)}>
        <UserName member={member} />
      </td>
      {roles.map(role => {
        const hasRole = member.roleIds.indexOf(role.id!) >= 0;

        return (
          <td key={role.id}>
            <Flex justify="center" align="center" grow={1}>
              <IconButton
                icon={hasRole ? 'check' : 'remove'}
                iconColor={hasRole ? 'var(--success-main)' : 'var(--secondary-main)'}
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
    <div className={css({ overflow: 'auto', width: '100%' })}>
      <table
        className={css({
          borderCollapse: 'collapse',
          td: {
            maxWidth: '120px',
          },
        })}
      >
        <thead
          className={css({
            position: 'sticky',
            top: 0,
            boxShadow: '0px 1px var(--divider-main)',
            background: 'var(--bg-secondary)',
          })}
        >
          {/* titles row */}
          <tr className={css({ boxShadow: '0px 1px var(--divider-main)' })}>
            <th className={cx(th_sm)}>{i18n.team.members}</th>
            <th colSpan={roles.length} className={cx(th_sm)}>
              {i18n.team.roles}
            </th>
          </tr>
          <tr>
            <td />
            {/* roles name row */}
            {roles.map(role => (
              <td
                key={'role-' + role.id}
                className={css({
                  /* display: 'flex',
                  alignItems: 'center', */
                  '&:hover button': {
                    visibility: 'visible',
                  },
                })}
              >
                <RoleLabel role={role} />
              </td>
            ))}
            <td className={css({ justifySelf: 'start' })}>
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
    </div>
  );
}
