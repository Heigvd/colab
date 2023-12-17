/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, TeamMember } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useLoadAssignments } from '../../store/selectors/assignmentSelector';
import { useAllProjectCardsButRootSorted } from '../../store/selectors/cardSelector';
import { useTeamMembers } from '../../store/selectors/teamMemberSelector';
import { useLoadUsersForCurrentProject } from '../../store/selectors/userSelector';
import {
  p_sm,
  space_sm,
  space_xl,
  space_xs,
  team1stHeaderRowStyle,
  team2ndHeaderCellStyle as team2ndHeaderCellDefaultStyle,
  team2ndHeaderRowStyle,
  teamPanelStyle,
  teamTableStyle as teamTableDefaultStyle,
  teamTableHeaderStyle,
  teamThStyle,
  text_xs,
} from '../../styling/style';
import { CardTitle } from '../cards/CardTitle';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import DeletionStatusIndicator from '../common/element/DeletionStatusIndicator';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import AssignmentDropDown from './AssignmentDropDown';
import UserName from './UserName';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Styles

const teamTableStyle = cx(
  teamTableDefaultStyle,
  css({
    td: {
      border: '1px solid var(--divider-main)',
    },
  }),
);

const team2ndHeaderCellStyle = cx(
  team2ndHeaderCellDefaultStyle,
  css({
    maxWidth: '70px',
  }),
);

const teamRowStyle = css({
  height: space_xl,
});

function teamCellStyle(cardDepth: number) {
  return cx(
    text_xs,
    p_sm,
    css({ color: cardDepth === 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }),
  );
}

const teamDeletionStatusStyle = css({
  margin: '0 ' + space_sm,
  flexShrink: 0,
});

const raciCellStyle = css({
  minWidth: '75px',
  maxWidth: '75px',
  minHeight: '40px',
  padding: '0 ' + space_xs,
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel

export default function ProjectTeamAssignmentsPanel(): JSX.Element {
  const i18n = useTranslations();

  const { status: statusMembers, members } = useTeamMembers();

  const statusUsers = useLoadUsersForCurrentProject();

  const statusAssignments = useLoadAssignments();

  const cardAndDepths = useAllProjectCardsButRootSorted();

  if (statusMembers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusMembers} />;
  }

  if (statusUsers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusUsers} />;
  }

  if (statusAssignments !== 'READY') {
    return <AvailabilityStatusIndicator status={statusAssignments} />;
  }

  return (
    <Flex className={teamPanelStyle}>
      <table className={teamTableStyle}>
        <thead className={teamTableHeaderStyle}>
          {/* titles header row */}
          <tr className={team1stHeaderRowStyle}>
            <th className={teamThStyle}>{i18n.modules.card.card}</th>
            <th className={teamThStyle} colSpan={members.length}>
              {i18n.team.members}
            </th>
          </tr>
          {/* members header row */}
          <tr className={team2ndHeaderRowStyle}>
            <td />
            <MembersRow members={members} />
          </tr>
        </thead>
        <tbody>
          {cardAndDepths.map(cardAndDepth => {
            return (
              <CardWithRACIsRow
                key={'card-id' + cardAndDepth.card.id}
                card={cardAndDepth.card}
                cardDepth={cardAndDepth.depth}
                members={members}
              />
            );
          })}
        </tbody>
      </table>
    </Flex>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Members list

interface MembersRowProps {
  members: TeamMember[];
}

function MembersRow({ members }: MembersRowProps): JSX.Element {
  return (
    <>
      {members.map(member => (
        <td key={member.id} className={team2ndHeaderCellStyle}>
          <UserName member={member} withTitle />
        </td>
      ))}
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Row

interface CardWithRACIsRowProps {
  card: Card;
  cardDepth: number;
  members: TeamMember[];
}

function CardWithRACIsRow({ card, cardDepth, members }: CardWithRACIsRowProps): JSX.Element {
  return (
    <>
      <tr className={teamRowStyle}>
        <td className={teamCellStyle(cardDepth)}>
          <Flex align="center">
            {(() => {
              const arr = [];
              for (let i = 1; i < cardDepth; i++) {
                arr.push(<Icon key={i} icon="remove" color="var(--text-disabled)" opsz={'xs'} />);
              }
              return arr;
            })()}
            <Flex className={teamDeletionStatusStyle}>
              {/* It should not be displayed if deleted. But whenever there is a bug, it is obvious */}
              <DeletionStatusIndicator status={card.deletionStatus} size="xs" />
            </Flex>
            <CardTitle card={card} />
          </Flex>
        </td>

        {members.map(member => (
          <RACICell key={card.id + '-' + member.id} card={card} member={member} />
        ))}
      </tr>
    </>
  );
}

interface RACICellProps {
  card: Card;
  member: TeamMember;
}

function RACICell({ card, member }: RACICellProps): JSX.Element {
  return (
    <td className={raciCellStyle}>
      <AssignmentDropDown cardId={card.id} memberId={member.id} />
    </td>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
