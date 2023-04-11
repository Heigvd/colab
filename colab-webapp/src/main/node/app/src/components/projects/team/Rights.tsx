/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { HierarchicalPosition, TeamMember } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch } from '../../../store/hooks';
import {
  useIsCurrentTeamMemberOwner,
  useTeamMembers,
} from '../../../store/selectors/teamMemberSelector';
import { useLoadUsersForCurrentProject } from '../../../store/selectors/userSelector';
import { addNotification } from '../../../store/slice/notificationSlice';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Tips from '../../common/element/Tips';
import Flex from '../../common/layout/Flex';
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

export function RightLabelColumns(): JSX.Element {
  const i18n = useTranslations();

  return (
    <>
      {options.map(position => {
        return (
          <td
            key={position}
            className={cx(text_sm, text_semibold, css({ minWidth: '70px', textAlign: 'center' }))}
          >
            <Flex align="center" justify="center">
              <div>{<PrettyPrint position={position} />}</div>
              {position === 'GUEST' && (
                <Tips
                  iconClassName={cx(text_sm, lightTextStyle)}
                  className={cx(
                    text_sm,
                    css({ fontWeight: 'normal', display: 'flex', alignItems: 'center' }),
                  )}
                >
                  {i18n.team.rightsHelper.guest}
                </Tips>
              )}
            </Flex>
          </td>
        );
      })}
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
    <tr>
      <td className={cx(text_sm, css({ maxWidth: '170px', overflow: 'hidden' }))}>
        <UserName member={member} />
      </td>
      {options.map(right => {
        const isChecked =
          member.position === right || options.indexOf(right) < options.indexOf(member.position);
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
    <div className={css({ overflow: 'auto', width: '100%' })}>
      <table
        className={css({
          borderCollapse: 'collapse',
          marginBottom: space_xl,
          paddingBottom: space_lg,
          borderBottom: '1px solid var(--divider-main)',
        })}
      >
        {/* titles row */}
        <thead
          className={css({
            position: 'sticky',
            top: 0,
            boxShadow: '0px 1px var(--divider-main)',
          })}
        >
          <tr>
            <th className={cx(th_sm)}>{i18n.team.members}</th>
            <th className={cx(th_sm)} colSpan={options.length}>
              {i18n.team.rights}
            </th>
          </tr>
          {/* rights name row */}
          <tr>
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
    </div>
  );
}
