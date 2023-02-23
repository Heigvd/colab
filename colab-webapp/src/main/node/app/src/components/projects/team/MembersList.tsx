/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { Project, TeamMember, User } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import { useCurrentUser, useUserAccounts } from '../../../selectors/userSelector';
import { useAppDispatch, useAppSelector, useLoadingState } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import IconButton from '../../common/element/IconButton';
import InlineLoading from '../../common/element/InlineLoading';
import { DiscreetInput } from '../../common/element/Input';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { lightTextStyle, space_sm, space_xs, text_sm, text_xs } from '../../styling/style';
import { gridNewLine } from './Team';

export interface UserNameProps {
  user: User;
  me?: boolean;
}

const UserName = ({ user, me }: UserNameProps) => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const updateDisplayName = React.useCallback(
    (displayName: string) => {
      dispatch(API.updateUser({ ...user, commonname: displayName }));
    },
    [dispatch, user],
  );
  return (
    <Flex>
      {me ? (
        <DiscreetInput
          value={user.commonname || undefined}
          placeholder={i18n.authentication.field.username}
          onChange={updateDisplayName}
        />
      ) : (
        <>
          {user.commonname} || <p className={cx(text_xs, lightTextStyle)}>No username</p>
        </>
      )}
    </Flex>
  );
};

export interface UserMailProps {
  user: User;
}

const UserMail = ({ user }: UserMailProps) => {
  const usermails = useUserAccounts(user.id);
  if(usermails === 'LOADING') {
    return (<InlineLoading />)
  } else {return (
    <>{usermails.map((account)=><p key={account.id}>{account.email}</p>)}</>
  );}
  
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

  /*  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]); */

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
  } else if (user == null) {
    return (
      <tr>
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
          <Flex align="center">
            <Icon
              icon={'hourglass_top'}
              opsz="xs"
              className={css({ marginRight: space_sm })}
              title={i18n.authentication.info.pendingInvitation + '...'}
            />
            {member.displayName}
          </Flex>
        </td>
        <td />
        <td />
        <td />
        <td />
        <td>
          <Flex align='center'>
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
          <IconButton
            icon="delete"
            title={'Delete member'}
            onClick={() => setShowModal('delete')}
            className={'hoverButton ' + css({ pointerEvents: 'none', opacity: 0, padding: space_xs })}
          />
          </Flex>
        </td>
      </tr>
    );
  } else {
    return (
      <tr>
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
        <td className={cx(gridNewLine, text_sm)}>
          <UserName user={user} me={currentUser?.id === member.userId} />
        </td>
        <td>{user.firstname}</td>
        <td>{user.lastname}</td>
        <td><UserMail user={user} /></td>
        <td>{user.affiliation}</td>
        <td className={css({display: 'flex', justifyContent: 'flex-end'})}>
          <IconButton
            icon="delete"
            title={'Delete member'}
            onClick={() => setShowModal('delete')}
            className={'hoverButton ' + css({ pointerEvents: 'none', opacity: 0, padding: space_xs })}
          />
        </td>
      </tr>
    );
  }
};

export default function MembersList({ project }: { project: Project }): JSX.Element {
  const i18n = useTranslations();
  const projectId = project.id;
  const { members } = useAndLoadProjectTeam(projectId);
  return (
    <table
      className={cx(
        text_xs,
        css({
          borderBottom: '1px solid var(--divider-main)',
          textAlign: 'left',
          borderCollapse: 'collapse',
          borderColor: 'transparent',
          'tr:not(:first-child):hover': {
            backgroundColor: 'var(--bg-secondary)',
          },
          'tr:hover .hoverButton': {
            opacity: 1,
            pointerEvents: 'auto',
            visibility: 'visible',
          },
          td: {
            padding: space_xs,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }),
      )}
    >
      <tr>
        <th>{i18n.user.model.commonName}</th>
        <th>{i18n.user.model.firstname}</th>
        <th>{i18n.user.model.lastname}</th>
        <th>{i18n.authentication.field.emailAddress}</th>
        <th>{i18n.user.model.affiliation}</th>
        <th></th>
      </tr>
      {members.map(member => {
        return <MemberRow key={member.id} member={member} />;
      })}
    </table>
  );
}
