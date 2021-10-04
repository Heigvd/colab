import { Card, InvolvementLevel, TeamMember, TeamRole } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { getDisplayName } from '../../helper';
import logger from '../../logger';
import { CardAcl, useCardACL } from '../../selectors/cardSelector';
import { useProjectBeingEdited, useProjectTeam } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import Flex from '../common/Flex';
import InlineLoading from '../common/InlineLoading';
import InvolvementSelector from './InvolvementSelector';

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
    <Flex>
      {role.name}:{' '}
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
    <Flex>
      {user != null ? getDisplayName(user) : member.id}:{' '}
      <InvolvementSelector self={self} effectives={effective} onChange={onChangeCb} />
    </Flex>
  );
}

interface Props {
  card: Card;
}

export default function CardACL({ card }: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const { project } = useProjectBeingEdited();
  const { members, roles, status: teamStatus } = useProjectTeam(project?.id);
  const acl = useCardACL(card.id);

  React.useEffect(() => {
    if (teamStatus == 'NOT_INITIALIZED') {
      if (project?.id != null) {
        logger.info('Load Team');
        dispatch(API.getProjectTeam(project.id));
      }
    }
  }, [dispatch, teamStatus, project?.id]);

  React.useEffect(() => {
    logger.info('Effect ', acl.status.missingCardId, ' | ', acl.status.missingAclCardId);
    if (acl.status.missingCardId != null) {
      logger.info('Load Card #', acl.status.missingCardId);
      dispatch(API.getCard(acl.status.missingCardId));
    }

    if (acl.status.missingAclCardId != null) {
      logger.info('Load ACL Card #', acl.status.missingAclCardId);
      dispatch(API.getACL(acl.status.missingAclCardId));
    }
  }, [acl.status.missingAclCardId, acl.status.missingCardId, dispatch]);

  if (teamStatus === 'INITIALIZED') {
    return (
      <>
        {roles.map(role => (
          <RoleACL key={role.id} role={role} acl={acl} />
        ))}
        {members.map(member => (
          <MemberACL key={member.id} member={member} acl={acl} />
        ))}
      </>
    );
  } else {
    return <InlineLoading />;
  }
}
