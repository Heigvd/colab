/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Assignment, InvolvementLevel, TeamMember } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import {
  useAssignmentForCardAndMember,
  useAssignmentsForCard,
} from '../../store/selectors/assignmentSelector';
import { useTeamMembers } from '../../store/selectors/teamMemberSelector';
import { useLoadUsersForCurrentProject } from '../../store/selectors/userSelector';
import { AvailabilityStatus } from '../../store/store';
import { th_sm } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IconButton from '../common/element/IconButton';
import UserName from './UserName';

// -------------------------------------------------------------------------------------------------
// Assignments options
// -------------------------------------------------------------------------------------------------

const options: InvolvementLevel[] = ['RESPONSIBLE', 'ACCOUNTABLE', 'SUPPORT'];

function PrettyPrint({ involvementLevel }: { involvementLevel: InvolvementLevel }): JSX.Element {
  const i18n = useTranslations();

  switch (involvementLevel) {
    case 'RESPONSIBLE':
      return <>{i18n.team.assignment.labels.responsible}</>;
    case 'ACCOUNTABLE':
      return <>{i18n.team.assignment.labels.accountable}</>;
    default:
      return <>{i18n.team.assignment.labels.support}</>;
  }
}

// -------------------------------------------------------------------------------------------------
// Header column
// -------------------------------------------------------------------------------------------------

function TeamAssignmentHeaderColumns(): JSX.Element {
  const i18n = useTranslations();

  return (
    <thead>
      <tr>
        <th className={cx(th_sm)}>{i18n.team.members}</th>
        {options.map(involvementLevel => (
          <th key={involvementLevel} className={cx(th_sm)}>
            <PrettyPrint involvementLevel={involvementLevel} />
          </th>
        ))}
      </tr>
    </thead>
  );
}

// -------------------------------------------------------------------------------------------------
// Row
// -------------------------------------------------------------------------------------------------

interface TeamAssignmentRowProps {
  cardId: number;
  member: TeamMember;
  readOnly?: boolean;
}

function TeamAssignmentRow({ cardId, member, readOnly }: TeamAssignmentRowProps): JSX.Element {
  const { status, assignment } = useAssignmentForCardAndMember(cardId, member.id);

  return (
    <tr>
      <td>
        <UserName member={member} />
      </td>
      {options.map(opt => (
        <td key={opt}>
          <IconCheckBox
            cardId={cardId}
            memberId={member.id}
            fetchingStatus={status}
            currentAssignment={assignment}
            involvementLevel={opt}
            readOnly={readOnly}
          />
        </td>
      ))}
    </tr>
  );
}

interface IconCheckBoxProps {
  cardId: number;
  memberId: number | undefined | null;
  fetchingStatus: AvailabilityStatus;
  currentAssignment: Assignment | null;
  involvementLevel: InvolvementLevel;
  readOnly?: boolean;
}

function IconCheckBox({
  memberId,
  cardId,
  fetchingStatus,
  currentAssignment,
  involvementLevel,
  readOnly,
}: IconCheckBoxProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const isChecked =
    currentAssignment != null && currentAssignment.involvementLevel === involvementLevel;

  const onClick = React.useCallback(() => {
    if (memberId != null && cardId != null) {
      if (!isChecked) {
        dispatch(
          API.setAssignment({
            cardId,
            memberId,
            involvementLevel,
          }),
        );
      } else {
        dispatch(
          API.removeAssignmentLevel({
            cardId,
            memberId,
          }),
        );
      }
    }
  }, [cardId, memberId, isChecked, involvementLevel, dispatch]);

  if (fetchingStatus !== 'READY') {
    return <AvailabilityStatusIndicator status={fetchingStatus} />;
  }

  return (
    <IconButton
      icon={isChecked ? 'check' : 'remove'}
      iconColor={isChecked ? 'var(--success-main)' : 'var(--secondary-main)'}
      title={
        isChecked
          ? i18n.team.assignment.actions.clickToRemoveAssignment
          : i18n.team.assignment.actions.clickToGiveAssignment
      }
      onClick={onClick}
      disabled={readOnly}
    />
  );
}

// -------------------------------------------------------------------------------------------------
// Panel
// -------------------------------------------------------------------------------------------------

interface CardAssignmentsPanelProps {
  cardId: number;
  readOnly?: boolean;
}

export default function CardAssignmentsPanel({
  cardId,
  readOnly,
}: CardAssignmentsPanelProps): JSX.Element {
  const { status: statusMembers, members } = useTeamMembers();

  // just to load assignments once for the card
  useAssignmentsForCard(cardId);

  // usefull for team members' display name, load all users at once
  const statusUsers = useLoadUsersForCurrentProject();

  if (statusMembers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusMembers} />;
  }

  if (statusUsers !== 'READY') {
    return <AvailabilityStatusIndicator status={statusUsers} />;
  }

  return (
    <>
      <table
        className={css({
          'tbody tr:hover': {
            backgroundColor: 'var(--gray-100)',
          },
          'tr:hover .hoverButton': {
            pointerEvents: 'auto',
            visibility: 'visible',
          },
        })}
      >
        {/* titles row */}
        <TeamAssignmentHeaderColumns />
        <tbody>
          {members.map(member => {
            return (
              <TeamAssignmentRow
                key={member.id}
                cardId={cardId}
                member={member}
                readOnly={readOnly}
              />
            );
          })}
        </tbody>
      </table>
    </>
  );
}
