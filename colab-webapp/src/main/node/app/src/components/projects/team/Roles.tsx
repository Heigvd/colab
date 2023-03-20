/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useCurrentProject } from '../../../selectors/projectSelector';
import { useTeamMembers } from '../../../selectors/teamMemberSelector';
import { useTeamRoles } from '../../../selectors/teamRoleSelector';
import { useLoadUsersForCurrentProject } from '../../../selectors/userSelector';
import { useAppDispatch } from '../../../store/hooks';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import IconButton from '../../common/element/IconButton';
import { DiscreetInput } from '../../common/element/Input';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
import OpenClose from '../../common/layout/OpenClose';
import {
  lightIconButtonStyle,
  p_2xs,
  space_lg,
  space_sm,
  space_xl,
  text_sm,
  th_sm,
} from '../../styling/style';
import { gridNewLine } from './TeamTabs';
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
    <>
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
        maxWidth={'calc(100% - 30px)'}
        inputDisplayClassName={css({ overflow: 'hidden', textOverflow: 'ellipsis' })}
      />
      <IconButton
        icon="delete"
        title={i18n.team.clickToRemoveRole}
        onClick={showDeleteModal}
        className={cx(p_2xs, css({ visibility: 'hidden' }))}
      />
    </>
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
    <>
      <div className={cx(gridNewLine, text_sm)}>
        <UserName member={member} />
      </div>

      {roles.map(role => {
        const hasRole = member.roleIds.indexOf(role.id!) >= 0;

        return (
          <IconButton
            key={role.id}
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
        );
      })}
    </>
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
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: `repeat(${roles.length + 2}, minmax(120px, 1fr))`,
        justifyItems: 'center',
        alignItems: 'center',
        '& > div': {
          maxWidth: '100%',
        },
        marginBottom: space_xl,
        paddingBottom: space_lg,
        borderBottom: '1px solid var(--divider-main)',
        gap: space_sm,
      })}
    >
      {/* titles row */}
      <div className={cx(th_sm, css({ gridColumnStart: 1, gridColumnEnd: 2 }))}>
        {i18n.team.members}
      </div>
      <div className={cx(th_sm, css({ gridColumnStart: 2, gridColumnEnd: 'end' }))}>
        {i18n.team.roles}
      </div>

      {/* roles name row */}
      <div />
      {roles.map(role => (
        <div
          key={'role-' + role.id}
          className={css({
            display: 'flex',
            alignItems: 'center',
            '&:hover button': {
              visibility: 'visible',
            },
          })}
        >
          <RoleLabel role={role} />
        </div>
      ))}
      <div className={css({ justifySelf: 'start' })}>
        <CreateRoleButton />
      </div>

      {/* data rows : member -> role checks */}
      {members.map(member => {
        return <MemberWithRolesChecksRow key={member.id} member={member} roles={roles} />;
      })}
    </div>
  );
}
