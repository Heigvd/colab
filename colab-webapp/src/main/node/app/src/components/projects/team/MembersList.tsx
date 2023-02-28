/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember, User } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useCurrentProjectId } from '../../../selectors/projectSelector';
import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import { useCurrentUser, useUserAccounts } from '../../../selectors/userSelector';
import { useAppDispatch, useAppSelector, useLoadingState } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import IconButton from '../../common/element/IconButton';
import InlineLoading from '../../common/element/InlineLoading';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
import Icon from '../../common/layout/Icon';
import {
  lightTextStyle,
  space_sm,
  space_xs,
  text_semibold,
  text_xs,
  th_sm,
} from '../../styling/style';
import UserName from './UserName';

export interface UserMailProps {
  user: User;
}

const UserMail = ({ user }: UserMailProps) => {
  const usermails = useUserAccounts(user.id);
  if (usermails === 'LOADING') {
    return <InlineLoading />;
  } else {
    return (
      <>
        {usermails.map(account => (
          <p key={account.id}>{account.email}</p>
        ))}
      </>
    );
  }
};

export interface MemberRowProps {
  member: TeamMember;
}

const MemberRow = ({ member }: MemberRowProps) => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const { currentUser } = useCurrentUser();
  const { isLoading, startLoading, stopLoading } = useLoadingState();
  const [showModal, setShowModal] = React.useState('');
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

  if (user == 'LOADING') {
    return <InlineLoading />;
  } else if (user == 'ERROR') {
    return <Icon icon={'skull'} />;
  } else {
    return (
      <tr className={cx({ [text_semibold]: currentUser?.id === member?.userId })}>
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
        <td className={cx(text_xs, lightTextStyle)}>
          <UserName user={user} member={member} currentUser={currentUser} />
        </td>
        {user ? (
          <>
            <td>{user.firstname}</td>
            <td>{user.lastname}</td>
            <td>
              <UserMail user={user} />
            </td>
            <td>{user.affiliation}</td>
          </>
        ) : (
          <>
            <td />
            <td />
            <td />
            <td />
          </>
        )}

        <td className={css({ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' })}>
          {user == null && (
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
          {currentUser?.id != member?.userId && (
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
  }
};

export default function MembersList(): JSX.Element {
  const i18n = useTranslations();

  const projectId = useCurrentProjectId();
  const { members } = useAndLoadProjectTeam(projectId);

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
        <th className={th_sm}>{i18n.authentication.field.emailAddress}</th>
        <th className={th_sm}>{i18n.user.model.affiliation}</th>
        <th></th>
      </tr>
      {members.map(member => {
        return <MemberRow key={member.id} member={member} />;
      })}
    </table>
  );
}
