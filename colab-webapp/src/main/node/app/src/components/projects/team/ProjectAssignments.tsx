/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, TeamMember } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useLoadAssignments } from '../../../selectors/assignmentSelector';
import { useAllProjectCardsButRootSorted } from '../../../selectors/cardSelector';
import { useTeamMembers } from '../../../selectors/teamMemberSelector';
import { useLoadUsersForCurrentProject } from '../../../selectors/userSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { p_sm, p_xs, space_xl, space_xs, text_xs, th_sm } from '../../styling/style';
import AssignmentDropDown from './AssignmentDropDown';
import UserName from './UserName';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel
////////////////////////////////////////////////////////////////////////////////////////////////////

export default function ProjectTeamAssignmentsPanel(): JSX.Element {
  const i18n = useTranslations();

  // const statusCards = useLoadCardsForCurrentProject();

  // const statusCardContents = useLoadCardContentsForCurrentProject();

  const { status: statusMembers, members } = useTeamMembers();

  const statusUsers = useLoadUsersForCurrentProject();

  const statusAssignments = useLoadAssignments();

  const cardAndDepths = useAllProjectCardsButRootSorted();

  // if (statusCards !== 'READY') {
  //   return <AvailabilityStatusIndicator status={statusCards} />;
  // }

  // if (statusCardContents !== 'READY') {
  //   return <AvailabilityStatusIndicator status={statusCardContents} />;
  // }

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
    <div className={css({ overflow: 'auto' })}>
      <table
        className={css({
          borderCollapse: 'collapse',
          td: {
            border: '1px solid var(--divider-main)',
          },
        })}
      >
        <thead
          className={css({
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--bg-primary)',
            boxShadow: '0px 1px var(--divider-main)',
          })}
        >
          <tr>
            <th className={cx(th_sm, css({ boxShadow: '0px 1px var(--divider-main)' }))}>
              {i18n.modules.card.card}
            </th>
            <th
              colSpan={members.length}
              className={cx(th_sm, css({ boxShadow: '0px 1px var(--divider-main)' }))}
            >
              {i18n.team.members}
            </th>
          </tr>
          <MembersRow members={members} />
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
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Member names
////////////////////////////////////////////////////////////////////////////////////////////////////

function MembersRow({ members }: { members: TeamMember[] }): JSX.Element {
  return (
    <tr>
      <td />
      {members.map(member => (
        <td
          key={member.id}
          className={cx(text_xs, p_xs, css({ maxWidth: '70px', textAlign: 'center' }))}
        >
          <UserName member={member} withTitle />
        </td>
      ))}
    </tr>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Card name and Assignments
////////////////////////////////////////////////////////////////////////////////////////////////////

interface CardWithRACIsRowProps {
  card: Card;
  cardDepth: number;
  members: TeamMember[];
}

function CardWithRACIsRow({ card, cardDepth, members }: CardWithRACIsRowProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <>
      <tr className={css({ height: space_xl })}>
        <td
          className={cx(text_xs, p_sm, css({ color: 'var(--text-secondary)' }), {
            [css({ color: 'var(--text-primary)' })]: cardDepth === 1,
          })}
        >
          <Flex align="center">
            {(() => {
              const arr = [];
              for (let i = 1; i < cardDepth; i++) {
                arr.push(<Icon key={i} icon="remove" color="var(--text-disabled)" opsz={'xs'} />);
              }
              return arr;
            })()}
            {card.title || i18n.modules.card.untitled}
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
    <td
      className={css({
        minWidth: '75px',
        maxWidth: '75px',
        minHeight: '40px',
        padding: '0 ' + space_xs,
      })}
    >
      <AssignmentDropDown cardId={card.id} memberId={member.id} />
    </td>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
