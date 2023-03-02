/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, InvolvementLevel, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import logger from '../../logger';
import { CardAcl, useAndLoadCardACL } from '../../selectors/cardSelector';
import { useAndLoadCurrentProjectTeam, useUserByTeamMember } from '../../selectors/teamSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import { space_lg } from '../styling/style';
import InvolvementSelector, { RASSelector } from './InvolvementSelector';

const titleSeparationStyle = css({
  margin: space_lg + ' 0',
  borderBottom: '1px solid var(--divider-main)',
  width: '100%',
});

const labelStyle = cx(
  css({
    fontWeight: '500',
  }),
);
export function RoleACL({ role, acl }: { role: TeamRole; acl: CardAcl }): JSX.Element {
  const self = acl.self.roles[role.id || -1];
  const effective = acl.effective.roles[role.id || -1];
  const dispatch = useAppDispatch();

  const onChangeCb = React.useCallback(
    (value: InvolvementLevel | null) => {
      logger.info('New role level: ', value);
      if (role.id != null && acl.status.cardId != null) {
        if (value != null) {
          dispatch(
            API.setRoleInvolvement({
              roleId: role.id,
              involvement: value,
              cardId: acl.status.cardId,
            }),
          );
        } else {
          dispatch(API.clearRoleInvolvement({ roleId: role.id, cardId: acl.status.cardId }));
        }
      }
    },
    [role.id, acl.status.cardId, dispatch],
  );

  return (
    <Flex align="center">
      <div className={labelStyle}>{role.name}:</div>
      <InvolvementSelector
        self={self}
        effectives={effective ? [effective] : []}
        onChange={onChangeCb}
      />
    </Flex>
  );
}

/* ARCHIVE export function MemberACL({ member, acl }: { member: TeamMember; acl: CardAcl }): JSX.Element {
  const self = acl.self.members[member.id || -1];
  const effective = acl.effective.members[member.id || -1];
  const dispatch = useAppDispatch();

  const user = useAppSelector(state => {
    if (member.userId != null) {
      return state.users.users[member.userId];
    } else {
      // no user id looks like a pending invitation
      return null;
    }
  });

  const onChangeCb = React.useCallback(
    (value: InvolvementLevel | null) => {
      logger.info('New role level: ', value);
      if (member.id != null && acl.status.cardId != null) {
        if (value != null) {
          dispatch(
            API.setMemberInvolvement({
              memberId: member.id,
              involvement: value,
              cardId: acl.status.cardId,
            }),
          );
        } else {
          dispatch(API.clearMemberInvolvement({ memberId: member.id, cardId: acl.status.cardId }));
        }
      }
    },
    [acl.status.cardId, member.id, dispatch],
  );

  React.useEffect(() => {
    if (member.userId != null && user === undefined) {
      // member is linked to a user. This user is not yet known
      // load it
      dispatch(API.getUser(member.userId));
    }
  }, [member.userId, user, dispatch]);

  return (
    <Flex align="center">
      <div className={labelStyle}>{entityIs(user, 'User') ? getDisplayName(user) : member.id}:</div>
      <InvolvementSelector self={self} effectives={effective} onChange={onChangeCb} />
    </Flex>
  );
} */

export function MemberACL({ member, acl }: { member: TeamMember; acl: CardAcl }): JSX.Element {
  const self = acl.self.members[member.id || -1];
  const effective = acl.effective.members[member.id || -1];
  const dispatch = useAppDispatch();

  useUserByTeamMember(member);

  const onChangeCb = React.useCallback(
    (value: InvolvementLevel | null) => {
      logger.info('New role level: ', value);
      if (member.id != null && acl.status.cardId != null) {
        if (value != null) {
          dispatch(
            API.setMemberInvolvement({
              memberId: member.id,
              involvement: value,
              cardId: acl.status.cardId,
            }),
          );
        } else {
          dispatch(API.clearMemberInvolvement({ memberId: member.id, cardId: acl.status.cardId }));
        }
      }
    },
    [acl.status.cardId, member.id, dispatch],
  );

  return (
    <Flex align="center">
      {/* <div className={labelStyle}>{entityIs(user, 'User') ? getDisplayName(user) : member.id}:</div> */}
      <RASSelector self={self} effectives={effective} onChange={onChangeCb} />
    </Flex>
  );
}

interface CardACLProps {
  card: Card;
}

export default function CardACL({ card }: CardACLProps): JSX.Element {
  const { members, roles, status: teamStatus } = useAndLoadCurrentProjectTeam();
  const acl = useAndLoadCardACL(card.id);
  const i18n = useTranslations();

  if (teamStatus === 'READY') {
    return (
      <>
        <div className={titleSeparationStyle}>
          <h3>{i18n.team.roles}</h3>
        </div>
        {roles.map(role => (
          <RoleACL key={role.id} role={role} acl={acl} />
        ))}
        <div className={titleSeparationStyle}>
          <h3>{i18n.team.members}</h3>
        </div>
        {members.map(member => (
          <MemberACL key={member.id} member={member} acl={acl} />
        ))}
      </>
    );
  } else {
    return <InlineLoading />;
  }
}
