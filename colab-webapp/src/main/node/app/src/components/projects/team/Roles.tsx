/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { TeamMember, TeamRole } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useCurrentProject } from '../../../selectors/projectSelector';
import { useTeamRolesForCurrentProject } from '../../../selectors/teamRoleSelector';
import { useAndLoadCurrentProjectTeam, useUserByTeamMember } from '../../../selectors/teamSelector';
import { useAppDispatch } from '../../../store/hooks';
import { Destroyer } from '../../common/Destroyer';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import IconButton from '../../common/element/IconButton';
import { DiscreetInput, InlineInput } from '../../common/element/Input';
import Tips from '../../common/element/Tips';
import OpenClose from '../../common/layout/OpenClose';
import WithToolbar from '../../common/WithToolbar';
import {
  lightIconButtonStyle,
  lightTextStyle,
  space_lg,
  space_sm,
  space_xl,
  text_sm,
  th_sm,
} from '../../styling/style';
import { gridNewLine } from './Team';
import UserName from './UserName';

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

  return (
    <WithToolbar toolbarPosition="TOP_RIGHT" toolbar={<Destroyer onDelete={deleteCb} />}>
      <DiscreetInput
        value={role.name || ''}
        placeholder={i18n.team.fillRoleName}
        onChange={saveCb}
        maxWidth="150px"
      />
    </WithToolbar>
  );
}

function CreateRoleButton(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project } = useCurrentProject();

  const [name, setName] = React.useState('');

  return (
    <OpenClose
      collapsedChildren={
        <IconButton
          title={i18n.modules.team.actions.createRole}
          icon={'add'}
          className={lightIconButtonStyle}
        />
      }
    >
      {collapse =>
        project == null ? (
          <AvailabilityStatusIndicator status="ERROR" />
        ) : (
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
        )
      }
    </OpenClose>
  );
}

export interface MemberWithRoleRowProps {
  member: TeamMember;
  roles: TeamRole[];
}

function MemberWithRolesRow({ member, roles }: MemberWithRoleRowProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { user } = useUserByTeamMember(member);

  return (
    <>
      <div className={cx(gridNewLine, text_sm)}>
        <UserName user={user} member={member} />
      </div>
      {roles.map(role => {
        const hasRole = member.roleIds.indexOf(role.id!) >= 0;

        return (
          <IconButton
            key={role.id}
            icon={hasRole ? 'check' : 'remove'}
            iconColor={hasRole ? 'var(--success-main)' : 'var(--secondary-main)'}
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
}

export default function TeamRolesPanel(): JSX.Element {
  const i18n = useTranslations();

  const { members } = useAndLoadCurrentProjectTeam();

  const { status, roles } = useTeamRolesForCurrentProject();

  if (status !== 'READY' || roles == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
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
        <Tips
          iconClassName={cx(text_sm, lightTextStyle)}
          className={cx(text_sm, css({ fontWeight: 'normal' }))}
        >
          {i18n.team.rolesHelper}
        </Tips>
      </div>

      {/* role names row */}
      <div />
      {roles.map(role => (
        <div key={'role-' + role.id}>
          <RoleLabel role={role} />
        </div>
      ))}
      <div>
        <CreateRoleButton />
      </div>

      {/* data rows : member -> role checks */}
      {members.map(member => {
        return <MemberWithRolesRow key={member.id} member={member} roles={roles} />;
      })}
    </div>
  );
}
