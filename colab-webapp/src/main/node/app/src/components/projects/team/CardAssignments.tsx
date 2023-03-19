/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Assignment, InvolvementLevel, TeamMember } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAssignmentForCardAndMember } from '../../../selectors/assignmentSelector';
import {
  useTeamMembersHavingAssignment,
  useTeamMembersWithoutAssignment,
} from '../../../selectors/teamMemberSelector';
import { useLoadUsersForCurrentProject } from '../../../selectors/userSelector';
import { useAppDispatch } from '../../../store/hooks';
import { AvailabilityStatus } from '../../../store/store';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Button from '../../common/element/Button';
import IconButton from '../../common/element/IconButton';
import SelectInput from '../../common/element/SelectInput';
import Flex from '../../common/layout/Flex';
import { space_lg, space_sm, space_xl, space_xs, th_sm } from '../../styling/style';
import UserName from './UserName';

// TODO : style
// TODO : make it possible to have a row without RASO
// TODO : add a row

// TODO : disable add button
// TODO : display sweet names

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
        <th>{/* for delete action */}</th>
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
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { status, assignment } = useAssignmentForCardAndMember(cardId, member.id);

  const onDeleteRow = React.useCallback(() => {
    if (member.id != null && cardId != null) {
      dispatch(API.deleteAssignments({ memberId: member.id, cardId }));
    }
  }, [cardId, member.id, dispatch]);

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
      <td>
        {!readOnly && (
          <IconButton
            icon="delete"
            title={i18n.team.assignment.actions.clickToRemoveAssignment}
            onClick={onDeleteRow}
            className={'hoverButton ' + css({ visibility: 'hidden', padding: space_xs })}
          />
        )}
      </td>
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
// Add button
// -------------------------------------------------------------------------------------------------

interface TeamMemberAssignmentCreatorProps {
  cardId: number;
}

function TeamMemberAssignmentCreator({ cardId }: TeamMemberAssignmentCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { members: membersWithoutAssignment } = useTeamMembersWithoutAssignment(cardId);

  // TODO !
  const membersToSelect = React.useMemo(() => {
    return membersWithoutAssignment.map(m => ({
      label: m.displayName || 'Anonymous',
      value: m.id || 0,
    }));
  }, [membersWithoutAssignment]);

  const [isAdding, setIsAdding] = React.useState<boolean>(false);

  const [newMembers, setNewMembers] = React.useState<number[]>([]);

  return (
    <Flex gap={space_sm} align="center">
      {isAdding && (
        <>
          <SelectInput
            value={undefined} // see if ok
            isClearable={true}
            isMulti={true}
            options={membersToSelect}
            onChange={(selected: number[] | null) => {
              setNewMembers(selected || []);
            }}
          />
        </>
      )}
      <Button
        icon="add"
        variant={isAdding ? 'outline' : 'solid'}
        onClick={() => {
          if (isAdding) {
            newMembers.forEach(mId => {
              dispatch(
                API.createAssignment({
                  cardId,
                  memberId: mId,
                }),
              );
            });
          }
          setNewMembers([]);
          setIsAdding(e => !e);
        }}
      >
        {i18n.common.add}
      </Button>
    </Flex>
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
  const { status: statusMembers, members: membersWithAssignment } =
    useTeamMembersHavingAssignment(cardId);
  // Note : Assignments are loaded when fetching the members having Assignments

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
          marginBottom: space_xl,
          paddingBottom: space_lg,
          borderBottom: '1px solid var(--divider-main)',
          'tbody tr:hover': {
            backgroundColor: 'var(--bg-secondary)',
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
          {membersWithAssignment.map(member => {
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

      {!readOnly && (
        <Flex>
          <TeamMemberAssignmentCreator cardId={cardId} />
        </Flex>
      )}
    </>
  );
}
