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
import { useIsMyCurrentMemberOwner } from '../../../selectors/teamSelector';
import { useCurrentUser, useLoadUsersForCurrentProject } from '../../../selectors/userSelector';
import { useAppDispatch, useLoadingState } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import IconButton from '../../common/element/IconButton';
import { DiscreetInput } from '../../common/element/Input';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
import { p_2xs, space_sm, space_xs, text_semibold, text_xs, th_sm } from '../../styling/style';
import { PendingUserName } from './UserName';

////////////////////////////////////////////////////////////////////////////////////////////////////

export interface MemberRowProps {
  member: TeamMember;
}

const MemberRow = ({ member }: MemberRowProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { status, user } = useUserByTeamMember(member);

  const { currentUser } = useCurrentUser();

  const isCurrentMemberAnOwner = useIsMyCurrentMemberOwner();

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
    <tr /* className={cx({ [text_semibold]: isCurrentUser })} */>
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
          {isCurrentUser ? (
            <>
              <td>
                <DiscreetInput
                  value={user.commonname || undefined}
                  placeholder={i18n.user.model.username}
                  onChange={newVal => dispatch(API.updateUser({ ...user, commonname: newVal }))}
                  maxWidth="110px"
                  inputDisplayClassName={text_semibold}
                  containerClassName={p_2xs}
                />
              </td>
              <td>
                <DiscreetInput
                  value={user.firstname || undefined}
                  placeholder={i18n.user.model.firstname}
                  onChange={newVal => dispatch(API.updateUser({ ...user, firstname: newVal }))}
                  maxWidth="110px"
                  inputDisplayClassName={text_semibold}
                  containerClassName={p_2xs}
                />
              </td>
              <td>
                <DiscreetInput
                  value={user.lastname || undefined}
                  placeholder={i18n.user.model.lastname}
                  onChange={newVal => dispatch(API.updateUser({ ...user, lastname: newVal }))}
                  maxWidth="110px"
                  inputDisplayClassName={text_semibold}
                  containerClassName={p_2xs}
                />
              </td>
              <td>
                <DiscreetInput
                  value={user.username}
                  placeholder={i18n.user.model.username}
                  onChange={() => {
                    /* cannot be changed */
                  }}
                  maxWidth="110px"
                  mandatory
                  inputDisplayClassName={text_semibold}
                  containerClassName={p_2xs}
                  readOnly
                />
              </td>
              <td>
                <DiscreetInput
                  value={user.affiliation || undefined}
                  placeholder={i18n.user.model.affiliation}
                  onChange={newVal => dispatch(API.updateUser({ ...user, affiliation: newVal }))}
                  maxWidth="110px"
                  inputDisplayClassName={text_semibold}
                  containerClassName={p_2xs}
                />
              </td>
            </>
          ) : (
            <>
              <td>{user.commonname}</td>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.username}</td>
              <td>{user.affiliation}</td>
            </>
          )}
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
            title={i18n.team.actions.resendInvitation}
            onClick={sendInvitation}
            className={'hoverButton ' + css({ visibility: 'hidden', padding: space_xs })}
          />
        )}
        {!isCurrentUser && (user == null || isCurrentMemberAnOwner) && (
          <IconButton
            icon="delete"
            title={'Delete member'}
            onClick={showDeleteModal}
            className={'hoverButton ' + css({ visibility: 'hidden', padding: space_xs })}
          />
        )}
      </td>
    </tr>
  );
};

////////////////////////////////////////////////////////////////////////////////////////////////////

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
          /**Affichage du tableau */
          'tbody tr:hover': {
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
      <thead>
        <tr>
          <th className={th_sm}>{i18n.user.model.commonName}</th>
          <th className={th_sm}>{i18n.user.model.firstname}</th>
          <th className={th_sm}>{i18n.user.model.lastname}</th>
          <th className={th_sm}>{i18n.user.model.username}</th>
          <th className={th_sm}>{i18n.user.model.affiliation}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {members.map(member => (
          <MemberRow key={member.id} member={member} />
        ))}
      </tbody>
    </table>
  );
}
