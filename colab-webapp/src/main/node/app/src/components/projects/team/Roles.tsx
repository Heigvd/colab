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
import { selectCurrentProjectId, useCurrentProject } from '../../../selectors/projectSelector';
import { useAndLoadProjectTeam, useUserByTeamMember } from '../../../selectors/teamSelector';
import { useCurrentUser } from '../../../selectors/userSelector';
import { useAppDispatch, useAppSelector, useLoadingState } from '../../../store/hooks';
import { Destroyer } from '../../common/Destroyer';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import IconButton from '../../common/element/IconButton';
import { DiscreetInput, InlineInput } from '../../common/element/Input';
import Tips from '../../common/element/Tips';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
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

function CreateRole(): JSX.Element {
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
        )
      }
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

  const { user } = useUserByTeamMember(member);

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
      <div className={cx(gridNewLine, text_sm)}>
        <UserName user={user} member={member} currentUser={currentUser} />
      </div>
      {/* {currentUser?.id != member.userId ? (
        <DropDownMenu
          icon={'more_vert'}
          valueComp={{ value: '', label: '' }}
          buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_sm }))}
          onSelect={value => setShowModal(value.value)}
          entries={[
            ...(member.userId == null
              ? [
                  {
                    value: 'resend',
                    label: (
                      <>
                        <Icon icon={'mail'} /> {i18n.modules.team.actions.resendInvitation}
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
                  <Icon icon={'delete'} color={'var(--error-main)'} /> {i18n.common.delete}
                </>
              ),
            },
          ]}
        />
      ) : <div />} */}
      {roles.map(role => {
        const hasRole = roleIds.indexOf(role.id || -1) >= 0;
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
};

export default function TeamRoles(): JSX.Element {
  const i18n = useTranslations();

  const projectId = useAppSelector(selectCurrentProjectId);
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
          marginBottom: space_xl,
          paddingBottom: space_lg,
          borderBottom: '1px solid var(--divider-main)',
          gap: space_sm,
        })}
      >
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
        <div />

        {roles.map(role => (
          <div key={'role-' + role.id}>
            <RoleDisplay role={role} />
          </div>
        ))}
        <div>
          <CreateRole />
        </div>
        {members.map(member => {
          return <MemberWithProjectRole key={member.id} member={member} roles={roles} />;
        })}
      </div>
    </>
  );
}
