/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember, User } from 'colab-rest-client';
import * as React from 'react';
import { getDisplayName } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import { useUserByTeamMember } from '../../../selectors/teamMemberSelector';
import { useCurrentUserId } from '../../../selectors/userSelector';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import {
  ellipsisStyle,
  lightTextStyle,
  space_sm,
  text_semibold,
  text_xs,
} from '../../styling/style';

export interface UserNameProps {
  member: TeamMember;
  className?: string;
}

export function PendingUserName({ member, className }: UserNameProps) {
  const i18n = useTranslations();

  return (
    <Flex align="center" className={cx(text_xs, lightTextStyle, className)}>
      <Icon
        icon={'hourglass_top'}
        opsz="xs"
        className={css({ marginRight: space_sm })}
        title={i18n.authentication.info.pendingInvitation + '...'}
      />
      <p className={css({ overflow: 'hidden', textOverflow: 'ellipsis' })}>{member?.displayName}</p>
    </Flex>
  );
}

interface VerifiedUserNameProps {
  user: User;
  className?: string;
}

function VerifiedUserName({ user, className }: VerifiedUserNameProps) {
  const currentUserId = useCurrentUserId();
  const isCurrentUser: boolean = (currentUserId && currentUserId === user.id!) || false;

  return (
    <Flex className={cx(text_xs, { [text_semibold]: isCurrentUser }, className)}>
      <p className={ellipsisStyle}>{getDisplayName(user) || 'No username'}</p>
    </Flex>
  );
}

export default function UserName({ member, className }: UserNameProps): JSX.Element {
  const { user } = useUserByTeamMember(member);

  if (user == null) {
    return <PendingUserName member={member} className={className} />;
  } else {
    return <VerifiedUserName user={user} className={className} />;
  }
}
