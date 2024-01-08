/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember, User } from 'colab-rest-client';
import { InstanceMaker } from 'colab-rest-client/dist/ColabClient';
import * as React from 'react';
import useTranslations, { ColabTranslations } from '../../i18n/I18nContext';
import { useUserByTeamMember } from '../../store/selectors/teamMemberSelector';
import { selectUsers, useCurrentUserId } from '../../store/selectors/userSelector';
import { ColabState } from '../../store/store';
import { lightTextStyle, text_semiBold } from '../../styling/style';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';

////////////////////////////////////////////////////////////////////////////////////////////////////

export function getUserName(
  state: ColabState,
  i18n: ColabTranslations,
  participant: TeamMember | InstanceMaker,
): string {
  const userId = participant.userId;

  if (userId == null) {
    if (participant?.displayName) {
      return participant.displayName;
    }
  } else {
    const user = selectUsers(state)[userId];
    if (user != null && typeof user === 'object') {
      return getDisplayName(i18n, user);
    }
  }
  return i18n.user.label.anonymous;
}

export const getDisplayName = (
  i18n: ColabTranslations,
  user: User | undefined | null,
  participant?: TeamMember | InstanceMaker,
): string => {
  return (
    (user != null &&
      (user.firstname || user.lastname) &&
      `${user.firstname || ''} ${user.lastname || ''}`.trim()) ||
    participant?.displayName ||
    i18n.user.label.anonymous
  );
};

////////////////////////////////////////////////////////////////////////////////////////////////////

export interface UserNameProps {
  member: TeamMember;
  withTitle?: boolean;
  className?: string;
}

export default function UserName({
  member,
  withTitle = false,
  className,
}: UserNameProps): JSX.Element {
  const { user } = useUserByTeamMember(member);

  if (user == null) {
    return <PendingUserName participant={member} withTitle={withTitle} className={className} />;
  } else {
    return <VerifiedUserName user={user} withTitle={withTitle} className={className} />;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

interface PendingUserNameProps {
  participant: TeamMember | InstanceMaker;
  withTitle?: boolean;
  className?: string;
}

export function PendingUserName({ participant, withTitle, className }: PendingUserNameProps) {
  const i18n = useTranslations();

  const name = participant?.displayName || i18n.user.label.anonymous;

  return (
    <Flex
      align="center"
      className={cx(lightTextStyle, className)}
      title={withTitle ? name : undefined}
    >
      <Icon icon={'hourglass_top'} opsz="xs" title={i18n.authentication.info.pendingInvitation} />
      <p className={css({ overflow: 'hidden', textOverflow: 'ellipsis' })}>{name}</p>
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

interface VerifiedUserNameProps {
  user: User;
  withTitle?: boolean;
  className?: string;
}

function VerifiedUserName({ user, withTitle = false, className }: VerifiedUserNameProps) {
  const i18n = useTranslations();

  const currentUserId = useCurrentUserId();
  const isCurrentUser: boolean = (currentUserId && currentUserId === user.id!) || false;

  const name = getDisplayName(i18n, user);

  return (
    <Flex
      className={cx({ [text_semiBold]: isCurrentUser }, className)}
      title={withTitle ? name : undefined}
    >
      <p className={css({ whiteSpace: 'normal' })}>{name}</p>
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
