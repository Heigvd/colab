/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { HierarchicalPosition, TeamMember } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useTeamMembersForCurrentProject } from '../../../selectors/teamMemberSelector';
import { useMyCurrentMember } from '../../../selectors/teamSelector';
import { useLoadUsersForCurrentProject } from '../../../selectors/userSelector';
import { useAppDispatch } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
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

////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////

export interface MemberWithProjectRightsProps {
  member: TeamMember;
  isCurrentUserAnOwner: boolean;
  isTheOnlyOwner: boolean;
}

const MemberWithProjectRights = ({
  member,
  isCurrentUserAnOwner,
  isTheOnlyOwner,
}: MemberWithProjectRightsProps) => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [currentInternalValue, setCurrentInternalValue] = React.useState<HierarchicalPosition>(
    member.position,
  );

  const changeRights = React.useCallback(
    (newPosition: HierarchicalPosition | undefined) => {
      if (newPosition) {
        if (isTheOnlyOwner) {
          // cannot remove last owner
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'WARN',
              message: i18n.team.oneOwnerPerProject,
            }),
          );
        } else if (newPosition === 'OWNER' && !isCurrentUserAnOwner) {
          // cannot change ownership if not selft owner
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'WARN',
              message: i18n.team.notAllowedToChangeOwnerRights,
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
    [
      dispatch,
      i18n.team.oneOwnerPerProject,
      i18n.team.notAllowedToChangeOwnerRights,
      isCurrentUserAnOwner,
      isTheOnlyOwner,
      member.id,
    ],
  );

  return (
    <tr>
      <td className={cx(text_sm, css({ maxWidth: '170px', overflow: 'hidden' }))}>
        <UserName member={member} />
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

////////////////////////////////////////////////////////////////////////////////////////////////////

export default function TeamRightsPanel(): JSX.Element {
  const i18n = useTranslations();

  const { status, members } = useTeamMembersForCurrentProject();

  const currentMember = useMyCurrentMember();

  const statusUsers = useLoadUsersForCurrentProject();

  if (status !== 'READY' || members == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  if (statusUsers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusUsers} />;
  }

  const projectOwnerIds = members.filter(m => m.position === 'OWNER').map(m => m.id);

  return (
    <>
      <table
        className={css({
          marginBottom: space_xl,
          paddingBottom: space_lg,
          borderBottom: '1px solid var(--divider-main)',
        })}
      >
        {/* titles row */}
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
        </thead>{' '}
        <tbody>
          {/* rights name row */}
          <tr>
            <td />
            <PositionColumns />
          </tr>
          {/* data rows : member -> right */}
          {members.map(member => {
            return (
              <MemberWithProjectRights
                key={member.id}
                member={member}
                isCurrentUserAnOwner={
                  currentMember != null && projectOwnerIds.includes(currentMember.id)
                }
                isTheOnlyOwner={projectOwnerIds.length < 2 && projectOwnerIds.includes(member.id)}
              />
            );
          })}
        </tbody>
      </table>
    </>
  );
}
