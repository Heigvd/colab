/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { HierarchicalPosition, Project, TeamMember } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';

import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import { useCurrentUser } from '../../../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import Tips from '../../common/element/Tips';
import Icon, { IconSize } from '../../common/layout/Icon';
import {
  iconButtonStyle,
  LightIconButtonStyle,
  lightTextStyle,
  space_lg,
  space_xl,
  text_semibold,
  text_sm,
  th_sm,
} from '../../styling/style';
import UserName from './UserName';

function PrettyPrint({ position }: { position: HierarchicalPosition }): JSX.Element {
  const i18n = useTranslations();
  switch (position) {
    case 'OWNER':
      return <>{i18n.team.rolesNames.owner}</>;
    case 'INTERNAL':
      return <>{i18n.team.rolesNames.member}</>;
    case 'GUEST':
      return <>{i18n.team.rolesNames.guest}</>;
    default:
      return <>{i18n.team.rolesNames.member}</>;
  }
}

const options: HierarchicalPosition[] = ['GUEST', 'INTERNAL', 'OWNER'];

export function PositionColumns(): JSX.Element {
  function buildOption(position: HierarchicalPosition) {
    return {
      value: position,
      label: <PrettyPrint position={position} />,
    };
  }

  return (
    <>
      {options.map(option => (
        <td
          key={buildOption(option).value}
          className={cx(text_sm, text_semibold, css({ minWidth: '70px', textAlign: 'center' }))}
        >
          {buildOption(option).label}
        </td>
      ))}
    </>
  );
}

export interface MemberWithProjectRightsProps {
  member: TeamMember;
  isTheOnlyOwner: boolean;
}

const MemberWithProjectRights = ({ member, isTheOnlyOwner }: MemberWithProjectRightsProps) => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const { currentUser, status: currentUserStatus } = useCurrentUser();
  const [currentInternalValue, setCurrentInternalValue] = React.useState<HierarchicalPosition>(
    member.position,
  );
  //const { memberRight, setMemberRight} = React.useState<HierarchicalPosition | undefined>(member.position)
  const changeRights = React.useCallback(
    (newPosition: HierarchicalPosition | undefined) => {
      if (newPosition) {
        if (isTheOnlyOwner) {
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'WARN',
              message: i18n.team.oneOwnerPerProject,
            }),
          );
        } else {
          setCurrentInternalValue(newPosition);
          dispatch(
            API.setMemberPosition({
              memberId: member.id!,
              position: newPosition as HierarchicalPosition,
            }),
          );
        }
      }
    },
    [dispatch, i18n.team.oneOwnerPerProject, isTheOnlyOwner, member.id],
  );

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

  return (
    <tr>
      <td className={cx(text_sm, css({ maxWidth: '170px', overflow: 'hidden' }))}>
        <UserName user={user} member={member} currentUser={currentUser} />
      </td>
      {options.map(right => {
        const isChecked =
          currentInternalValue === right ||
          options.indexOf(right) < options.indexOf(currentInternalValue);
        const isSelected = currentInternalValue === right;
        return (
          <td key={right}>
            <Icon
              icon={isChecked ? 'radio_button_checked' : 'radio_button_unchecked'}
              onClick={() => {
                if (!isSelected) {
                  changeRights(right);
                }
              }}
              opsz={isSelected ? 'md' : 'sm'}
              className={cx(
                iconButtonStyle,
                LightIconButtonStyle('primary'),
                css({ transition: '0.2s', '&:hover': { fontSize: IconSize.md + 'px' } }),
              )}
            />
          </td>
        );
      })}
    </tr>
  );
};

export default function TeamRights({ project }: { project: Project }): JSX.Element {
  const i18n = useTranslations();
  const projectId = project.id;
  const { members } = useAndLoadProjectTeam(projectId);
  const projectOwners = members.filter(m => m.position === 'OWNER');
  return (
    <>
      <table
        className={css({
          marginBottom: space_xl,
          paddingBottom: space_lg,
          borderBottom: '1px solid var(--divider-main)',
        })}
      >
        <thead>
          <tr>
            <th className={cx(th_sm)}>{i18n.team.members}</th>
            <th className={cx(th_sm)} colSpan={options.length}>
              {i18n.team.rights}
              <Tips
                iconClassName={cx(text_sm, lightTextStyle)}
                className={cx(text_sm, css({ fontWeight: 'normal' }))}
              >
                {i18n.team.rightsHelper}
              </Tips>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td />
            <PositionColumns />
          </tr>

          {members.map(member => {
            return (
              <MemberWithProjectRights
                key={member.id}
                member={member}
                isTheOnlyOwner={projectOwners.length < 2 && projectOwners.includes(member)}
              />
            );
          })}
        </tbody>
      </table>
    </>
  );
}
