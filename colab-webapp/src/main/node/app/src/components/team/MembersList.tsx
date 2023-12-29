/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import {
  useIsCurrentTeamMemberOwner,
  useTeamMembers,
  useUserByTeamMember,
} from '../../store/selectors/teamMemberSelector';
import { useCurrentUser, useLoadUsersForCurrentProject } from '../../store/selectors/userSelector';
import { addNotification } from '../../store/slice/notificationSlice';
import { putInBinDefaultIcon } from '../../styling/IconDefault';
import {
  space_sm,
  space_xl,
  space_xs,
  team1stHeaderRowStyle,
  teamBodyRowStyle,
  teamPanelStyle,
  teamTableStyle as teamTableDefaultStyle,
  teamThStyle as teamThDefaultStyle,
  text_semiBold,
  text_xs,
} from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IconButton from '../common/element/IconButton';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import Flex from '../common/layout/Flex';
import { PendingUserName } from './UserName';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Style

const teamTableStyle = cx(
  teamTableDefaultStyle,
  text_xs,
  css({
    textAlign: 'left',
    'tbody tr:hover': {
      backgroundColor: 'var(--gray-100)',
    },
    'tr:hover .hoverButton': {
      pointerEvents: 'auto',
      visibility: 'visible',
    },
    td: {
      padding: space_sm + ' ' + space_xl + ' ' + space_sm + ' ' + space_xs,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  }),
);

const teamTableHeaderStyle = css({
  position: 'sticky',
  top: 0,
  boxShadow: '0px 1px var(--divider-main)',
  zIndex: 1,
  background: 'var(--bg-secondary)',
});

const teamThStyle = cx(
  teamThDefaultStyle,
  css({
    padding: space_xs + ' ' + space_xl + ' ' + space_xs + ' ' + space_xs,
  }),
);

const teamRowStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const teamRowActionButtonStyle = cx(
  'hoverButton',
  css({
    visibility: 'hidden',
    padding: space_xs,
  }),
);

function dataStyle(isCurrentUser: boolean) {
  return cx({ [text_semiBold]: isCurrentUser });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel

export default function TeamMembersPanel(): JSX.Element {
  const i18n = useTranslations();

  const { status, members } = useTeamMembers();

  const statusUsers = useLoadUsersForCurrentProject();

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
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
            <th className={teamThStyle}>{i18n.user.model.firstname}</th>
            <th className={teamThStyle}>{i18n.user.model.lastname}</th>
            <th className={teamThStyle}>{i18n.user.model.affiliation}</th>
            <th className={teamThStyle}></th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <MemberRow key={member.id} member={member} />
          ))}
        </tbody>
      </table>
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Row

interface MemberRowProps {
  member: TeamMember;
}

function MemberRow({ member }: MemberRowProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { status, user } = useUserByTeamMember(member);

  const { currentUser } = useCurrentUser();

  const isCurrentMemberAnOwner: boolean = useIsCurrentTeamMemberOwner();

  const isCurrentUser: boolean = currentUser?.id === member?.userId;
  const isPendingInvitation: boolean = user == null;

  const [showModal, setShowModal] = React.useState<'' | 'delete'>('');

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const resetState = React.useCallback(() => {
    setShowModal('');
  }, [setShowModal]);

  const showDeleteModal = React.useCallback(() => {
    setShowModal('delete');
  }, [setShowModal]);

  const deleteMember = React.useCallback(() => {
    startLoading();
    dispatch(API.deleteMember(member)).then(stopLoading);
  }, [dispatch, member, startLoading, stopLoading]);

  const sendInvitation = React.useCallback(() => {
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
            message: i18n.team.actions.invitationResent,
          }),
        ),
      );
    }
  }, [dispatch, i18n.team.actions.invitationResent, member.displayName, member.projectId]);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <tr className={teamBodyRowStyle}>
      {showModal === 'delete' && (
        <ConfirmDeleteModal
          title={i18n.team.deleteMember}
          message={<p>{i18n.team.sureDeleteMember}</p>}
          onCancel={resetState}
          onConfirm={deleteMember}
          confirmButtonLabel={i18n.team.deleteMember}
          isConfirmButtonLoading={isLoading}
        />
      )}
      {user ? (
        <>
          <td className={dataStyle(isCurrentUser)}>{user.firstname}</td>
          <td className={dataStyle(isCurrentUser)}>{user.lastname}</td>
          <td className={dataStyle(isCurrentUser)}>{user.affiliation}</td>
        </>
      ) : (
        <>
          <td>
            <PendingUserName participant={member} />
          </td>
          <td />
          <td />
        </>
      )}

      <td className={teamRowStyle}>
        {isPendingInvitation && (
          <IconButton
            icon="send"
            title={i18n.team.actions.resendInvitation}
            onClick={sendInvitation}
            className={teamRowActionButtonStyle}
          />
        )}
        {!isCurrentUser /* one cannot delete himself */ &&
          (user == null /* a pending invitation can be deleted by anyone */ ||
            isCurrentMemberAnOwner /* verified users can only be deleted by an owner */ ||
            currentUser?.admin) /* or an admin */ && (
            <IconButton
              icon={putInBinDefaultIcon}
              title={i18n.common.delete}
              onClick={showDeleteModal}
              className={teamRowActionButtonStyle}
            />
          )}
      </td>
    </tr>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
