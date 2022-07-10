/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, InvolvementLevel, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { getDisplayName } from '../../helper';
import logger from '../../logger';
import { CardAcl, useAndLoadCardACL } from '../../selectors/cardSelector';
import { useAndLoadProjectTeam, useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import { marginAroundStyle, paddingAroundStyle, space_M, space_S } from '../styling/style';
import InvolvementSelector from './InvolvementSelector';

const titleSeparationStyle = css({
  margin: space_M + ' 0',
  borderBottom: '1px solid var(--lightGray)',
  width: '100%',
});

const labelStyle = cx(
  marginAroundStyle([1, 2, 3], space_S),
  paddingAroundStyle([1, 2, 3], space_S),
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

export function MemberACL({ member, acl }: { member: TeamMember; acl: CardAcl }): JSX.Element {
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
      <div className={labelStyle}>{user != null ? getDisplayName(user) : member.id}:</div>
      <InvolvementSelector self={self} effectives={effective} onChange={onChangeCb} />
    </Flex>
  );
}

interface CardACLProps {
  card: Card;
}

export default function CardACL({ card }: CardACLProps): JSX.Element {
  const { project } = useProjectBeingEdited();
  const { members, roles, status: teamStatus } = useAndLoadProjectTeam(project?.id);
  const acl = useAndLoadCardACL(card.id);

  if (teamStatus === 'INITIALIZED') {
    return (
      <>
        <div className={titleSeparationStyle}>
          <h3>Roles</h3>
        </div>
        {roles.map(role => (
          <RoleACL key={role.id} role={role} acl={acl} />
        ))}
        <div className={titleSeparationStyle}>
          <h3>Members</h3>
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
