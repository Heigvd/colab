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
import { p_2xs, space_sm, space_xs, text_semibold, text_xs, th_sm } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IconButton from '../common/element/IconButton';
import { DiscreetInput } from '../common/element/Input';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import { PendingUserName } from './UserName';

////////////////////////////////////////////////////////////////////////////////////////////////////

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
    <tr>
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
                  placeholder={i18n.user.model.commonName}
                  onChange={newVal => dispatch(API.updateUser({ ...user, commonname: newVal }))}
                  maxWidth="110px"
                  inputDisplayClassName={text_semibold}
                  containerClassName={cx(p_2xs, css({ alignItems: 'flex-start' }))}
                />
              </td>
              <td>
                <DiscreetInput
                  value={user.firstname || undefined}
                  placeholder={i18n.user.model.firstname}
                  onChange={newVal => dispatch(API.updateUser({ ...user, firstname: newVal }))}
                  maxWidth="110px"
                  inputDisplayClassName={text_semibold}
                  containerClassName={cx(p_2xs, css({ alignItems: 'flex-start' }))}
                />
              </td>
              <td>
                <DiscreetInput
                  value={user.lastname || undefined}
                  placeholder={i18n.user.model.lastname}
                  onChange={newVal => dispatch(API.updateUser({ ...user, lastname: newVal }))}
                  maxWidth="110px"
                  inputDisplayClassName={text_semibold}
                  containerClassName={cx(p_2xs, css({ alignItems: 'flex-start' }))}
                />
              </td>
              <td>
                <DiscreetInput
                  value={user.username}
                  placeholder={i18n.user.model.username}
                  onChange={() => {
                    /* is not allowed to be changed */
                  }}
                  maxWidth="110px"
                  mandatory
                  inputDisplayClassName={text_semibold}
                  containerClassName={cx(p_2xs, css({ alignItems: 'flex-start' }))}
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
                  containerClassName={cx(p_2xs, css({ alignItems: 'flex-start' }))}
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
        {!isCurrentUser /* one cannot delete himself */ &&
          (user == null /* a pending invitation can be deleted by anyone */ ||
            isCurrentMemberAnOwner) /* verified users can only be deleted by an owner */ && (
            <IconButton
              icon="delete"
              title={i18n.common.delete}
              onClick={showDeleteModal}
              className={'hoverButton ' + css({ visibility: 'hidden', padding: space_xs })}
            />
          )}
      </td>
    </tr>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

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
    <div className={css({ overflow: 'auto', width: '100%' })}>
      <table
        className={cx(
          text_xs,
          css({
            textAlign: 'left',
            borderCollapse: 'collapse',
            /**Affichage du tableau */
            'tbody tr:hover': {
              backgroundColor: 'var(--gray-100)',
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
        <thead
          className={css({
            position: 'sticky',
            top: 0,
            boxShadow: '0px 1px var(--divider-main)',
            zIndex: 1,
          })}
        >
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
    </div>
  );
}
