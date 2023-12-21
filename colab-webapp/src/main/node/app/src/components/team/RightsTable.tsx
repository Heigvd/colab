/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { HierarchicalPosition, TeamMember } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import {
  useIsCurrentTeamMemberOwner,
  useTeamMembers,
} from '../../store/selectors/teamMemberSelector';
import { useLoadUsersForCurrentProject } from '../../store/selectors/userSelector';
import { addNotification } from '../../store/slice/notificationSlice';
import {
  LightIconButtonStyle,
  iconButtonStyle,
  lightTextStyle,
  p_0,
  team1stHeaderRowStyle,
  team2ndHeaderCellStyle as team2ndHeaderCellDefaultStyle,
  team2ndHeaderRowStyle,
  teamBodyRowStyle,
  teamPanelStyle,
  teamTableHeaderStyle,
  teamTableStyle,
  teamThStyle,
  text_sm,
  userNameCellStyle,
} from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Tips from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import Icon, { IconSize } from '../common/layout/Icon';
import UserName from './UserName';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Style

const team2ndHeaderCellStyle = cx(
  team2ndHeaderCellDefaultStyle,
  css({
    minWidth: '70px',
  }),
);

const tipStyle = cx(
  text_sm,
  css({
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center',
  }),
);

const iconTipStyle = cx(text_sm, lightTextStyle);

const iconCheckStyle = cx(
  iconButtonStyle,
  LightIconButtonStyle('primary'),
  p_0,
  css({
    transition: '0.2s',
    '&:hover': { fontSize: IconSize.md + 'px' },
  }),
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel

export default function TeamRightsPanel(): JSX.Element {
  const i18n = useTranslations();

  const { status, members } = useTeamMembers();

  const isCurrentMemberAnOwner = useIsCurrentTeamMemberOwner();

  const statusUsers = useLoadUsersForCurrentProject();

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  if (statusUsers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusUsers} />;
  }

  const projectOwnerIds = members.filter(m => m.position === 'OWNER').map(m => m.id);

  return (
    <Flex className={teamPanelStyle}>
      <table className={teamTableStyle}>
        <thead className={teamTableHeaderStyle}>
          {/* titles header row */}
          <tr className={team1stHeaderRowStyle}>
            <th className={teamThStyle}>{i18n.team.members}</th>
            <th className={teamThStyle} colSpan={rights.length}>
              {i18n.team.rights}
            </th>
          </tr>
          {/* rights name header row */}
          <tr className={team2ndHeaderRowStyle}>
            <td />
            <RightLabelColumns />
          </tr>
        </thead>
        <tbody>
          {/* data rows : member -> right */}
          {members.map(member => {
            return (
              <MemberWithProjectRights
                key={member.id}
                member={member}
                isCurrentUserAnOwner={isCurrentMemberAnOwner}
                isTheOnlyOwner={projectOwnerIds.length < 2 && projectOwnerIds.includes(member.id)}
              />
            );
          })}
        </tbody>
      </table>
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Rights list

const rights: HierarchicalPosition[] = ['GUEST', 'INTERNAL', 'OWNER'];

function RightLabelColumns(): JSX.Element {
  return (
    <>
      {rights.map(right => (
        <td key={right} className={team2ndHeaderCellStyle}>
          <RightLabel right={right} />
        </td>
      ))}
    </>
  );
}

interface RightLabelProps {
  right: HierarchicalPosition;
}

function RightLabel({ right }: RightLabelProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex align="center" justify="center">
      <div>{<PrettyPrint right={right} />}</div>
      {right === 'GUEST' && (
        <Tips iconClassName={iconTipStyle} className={tipStyle}>
          {i18n.team.rightsHelper.guest}
        </Tips>
      )}
    </Flex>
  );
}

function PrettyPrint({ right }: { right: HierarchicalPosition }): JSX.Element {
  const i18n = useTranslations();

  switch (right) {
    case 'OWNER':
      return <>{i18n.team.right.label.owner}</>;
    case 'INTERNAL':
      return <>{i18n.team.right.label.member}</>;
    case 'GUEST':
      return <>{i18n.team.right.label.guest}</>;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Row

interface MemberWithProjectRightsProps {
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

  const changeRights = React.useCallback(
    (
      newPosition: HierarchicalPosition | undefined,
      oldPosition: HierarchicalPosition | undefined,
    ) => {
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
        } else if ((newPosition === 'OWNER' || oldPosition === 'OWNER') && !isCurrentUserAnOwner) {
          // cannot change ownership if not selft owner
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'WARN',
              message: i18n.team.notAllowedToChangeOwnerRights,
            }),
          );
        } else {
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
    <tr className={teamBodyRowStyle}>
      <td className={userNameCellStyle}>
        <UserName member={member} />
      </td>
      {rights.map(right => {
        const isChecked =
          member.position === right || rights.indexOf(right) < rights.indexOf(member.position);
        const isSelected = member.position === right;
        return (
          <td key={right}>
            <Icon
              icon={isChecked ? 'radio_button_checked' : 'radio_button_unchecked'}
              onClick={() => {
                if (!isSelected) {
                  changeRights(right, member.position);
                }
              }}
              opsz="sm"
              className={iconCheckStyle}
            />
          </td>
        );
      })}
    </tr>
  );
};

////////////////////////////////////////////////////////////////////////////////////////////////////
