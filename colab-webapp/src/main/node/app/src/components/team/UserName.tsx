/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember, User } from 'colab-rest-client';
import * as React from 'react';
import { getDisplayName } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useUserByTeamMember } from '../../store/selectors/teamMemberSelector';
import { selectUsers, useCurrentUserId } from '../../store/selectors/userSelector';
import { ColabState } from '../../store/store';
import { ellipsisStyle, lightTextStyle, text_semibold, text_xs } from '../../styling/style';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import {InstanceMaker} from "colab-rest-client/dist/ColabClient";

interface PendingUserNameProps {
  participant: TeamMember | InstanceMaker;
  withTitle?: boolean;
  className?: string;
}

export function PendingUserName({ participant, withTitle, className }: PendingUserNameProps) {
  const i18n = useTranslations();

  const name = participant?.displayName || i18n.user.anonymous;

  return (
    <Flex
      align="center"
      className={cx(text_xs, lightTextStyle, className)}
      title={withTitle ? name : undefined}
    >
      <Icon icon={'hourglass_top'} opsz="xs" title={i18n.authentication.info.pendingInvitation} />
      <p className={css({ overflow: 'hidden', textOverflow: 'ellipsis' })}>{name}</p>
    </Flex>
  );
}

interface VerifiedUserNameProps {
  user: User;
  withTitle?: boolean;
  className?: string;
}

function VerifiedUserName({ user, withTitle = false, className }: VerifiedUserNameProps) {
  const i18n = useTranslations();

  const currentUserId = useCurrentUserId();
  const isCurrentUser: boolean = (currentUserId && currentUserId === user.id!) || false;

  const name = getDisplayName(user) || i18n.user.anonymous;

  return (
    <Flex
      className={cx(text_xs, { [text_semibold]: isCurrentUser }, className)}
      title={withTitle ? name : undefined}
    >
      <p className={ellipsisStyle}>{name}</p>
    </Flex>
  );
}

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

export function getUserName(state: ColabState, member: TeamMember): string | null | undefined {
  const userId = member.userId;

  if (userId == null) {
    return member?.displayName;
  } else {
    const user = selectUsers(state)[userId || 0];
    if (user != null && typeof user === 'object') {
      return getDisplayName(user);
    }
  }
  return null;
}
