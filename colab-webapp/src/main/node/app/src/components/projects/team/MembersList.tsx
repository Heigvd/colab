/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import {
  useTeamMembersForCurrentProject,
  useUserByTeamMember,
} from '../../../selectors/teamMemberSelector';
import { useCurrentUser, useLoadUsersForCurrentProject } from '../../../selectors/userSelector';
import { useAppDispatch, useLoadingState } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import IconButton from '../../common/element/IconButton';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
import { space_sm, space_xs, text_semibold, text_xs, th_sm } from '../../styling/style';
import { PendingUserName } from './UserName';

export interface MemberRowProps {
  member: TeamMember;
}

const MemberRow = ({ member }: MemberRowProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { status, user } = useUserByTeamMember(member);

  const { currentUser } = useCurrentUser();

  const isCurrentUser: boolean = currentUser?.id === member?.userId;
  const isPendingInvitation: boolean = user == null;

  const [showModal, setShowModal] = React.useState<'' | 'delete'>('');

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <tr className={cx({ [text_semibold]: isCurrentUser })}>
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
      {user ? (
        <>
          <td>{user.commonname}</td>
          <td>{user.firstname}</td>
          <td>{user.lastname}</td>
          <td>{user.username}</td>
          <td>{user.affiliation}</td>
        </>
      ) : (
        <>
          <td>
            <PendingUserName member={member} />
          </td>
          <td />
          <td />
          <td />
          <td />
        </>
      )}

      <td className={css({ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' })}>
        {isPendingInvitation && (
          <IconButton
            icon="send"
            title={i18n.modules.team.actions.resendInvitation}
            onClick={() => {
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
            }}
            className={'hoverButton ' + css({ visibility: 'hidden', padding: space_xs })}
          />
        )}
        {!isCurrentUser && (
          <IconButton
            icon="delete"
            title={'Delete member'}
            onClick={() => setShowModal('delete')}
            className={'hoverButton ' + css({ visibility: 'hidden', padding: space_xs })}
          />
        )}
      </td>
    </tr>
  );
};

export default function MembersListPanel(): JSX.Element {
  const i18n = useTranslations();

  const { status, members } = useTeamMembersForCurrentProject();

  const statusUsers = useLoadUsersForCurrentProject();

  if (status !== 'READY' || members == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  if (statusUsers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusUsers} />;
  }

  return (
    <table
      className={cx(
        text_xs,
        css({
          textAlign: 'left',
          borderCollapse: 'collapse',
          'tr:not(:first-child):hover': {
            backgroundColor: 'var(--bg-secondary)',
          },
          'tr:hover .hoverButton': {
            pointerEvents: 'auto',
            visibility: 'visible',
          },
          td: {
            padding: space_sm,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }),
      )}
    >
      <tr>
        <th className={th_sm}>{i18n.user.model.commonName}</th>
        <th className={th_sm}>{i18n.user.model.firstname}</th>
        <th className={th_sm}>{i18n.user.model.lastname}</th>
        <th className={th_sm}>{i18n.user.model.username}</th>
        <th className={th_sm}>{i18n.user.model.affiliation}</th>
        <th></th>
      </tr>
      {members.map(member => (
        <MemberRow key={member.id} member={member} />
      ))}
    </table>
  );
}
