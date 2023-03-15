/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { InvolvementLevel, TeamMember } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAclForCardAndMember } from '../../../selectors/aclSelector';
import {
  useTeamMembersHavingAcl,
  useTeamMembersWithoutAcl,
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

// TODO : remove involvements panel from the drop down menu and clean ...

// -------------------------------------------------------------------------------------------------
// Assignments options
// -------------------------------------------------------------------------------------------------

const options: InvolvementLevel[] = [
  'RESPONSIBLE',
  'ACCOUNTABLE',
  'CONSULTED_READWRITE',
  'INFORMED_READWRITE',
  'OUT_OF_THE_LOOP',
];

function PrettyPrint({ assignment }: { assignment: InvolvementLevel }): JSX.Element {
  const i18n = useTranslations();

  switch (assignment) {
    case 'RESPONSIBLE':
      return <>{i18n.team.raci.responsible}</>;
    case 'ACCOUNTABLE':
      return <>{i18n.team.raci.accountable}</>;
    case 'CONSULTED_READWRITE':
      return <>{i18n.team.raci.support}</>;
    case 'INFORMED_READWRITE':
      return <>{i18n.team.raci.support}</>;
    default:
      return <>{i18n.team.raci.accessDenied}</>;
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
        {options.map(assignment => (
          <th key={assignment} className={cx(th_sm)}>
            <PrettyPrint assignment={assignment} />
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

  const { status, acl } = useAclForCardAndMember(cardId, member.id);

  const onDeleteRow = React.useCallback(() => {
    if (member.id != null && cardId != null) {
      dispatch(API.clearMemberInvolvement({ memberId: member.id, cardId: cardId }));
    }
  }, [cardId, member.id, dispatch]);

  return (
    <tr>
      <td>
        <UserName member={member} />
      </td>
      {options.map(assignment => (
        <td key={assignment}>
          <IconCheckBox
            cardId={cardId}
            memberId={member.id}
            fetchingStatus={status}
            currentAssignment={acl?.cairoLevel}
            involvementColumn={assignment}
            readOnly={readOnly}
          />
        </td>
      ))}
      <td>
        {!readOnly && (
          <IconButton
            icon="delete"
            title={i18n.team.clickToRemoveAssignment}
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
  currentAssignment: InvolvementLevel | undefined | null;
  involvementColumn: InvolvementLevel;
  readOnly?: boolean;
}

function IconCheckBox({
  memberId,
  cardId,
  fetchingStatus,
  currentAssignment,
  involvementColumn,
  readOnly,
}: IconCheckBoxProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const isChecked = currentAssignment === involvementColumn;

  const onClick = React.useCallback(() => {
    if (memberId != null && cardId != null) {
      if (!isChecked) {
        dispatch(
          API.setMemberInvolvement({
            memberId: memberId,
            involvement: involvementColumn,
            cardId: cardId,
          }),
        );
      } else {
        dispatch(API.clearMemberInvolvement({ memberId: memberId, cardId: cardId }));
      }
    }
  }, [cardId, memberId, isChecked, involvementColumn, dispatch]);

  if (fetchingStatus !== 'READY') {
    return <AvailabilityStatusIndicator status={fetchingStatus} />;
  }

  return (
    <IconButton
      icon={isChecked ? 'check' : 'remove'}
      iconColor={isChecked ? 'var(--success-main)' : 'var(--secondary-main)'}
      title={isChecked ? i18n.team.clickToRemoveAssignment : i18n.team.clickToGiveAssignment}
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

  const { members: membersWithoutAcl } = useTeamMembersWithoutAcl(cardId);

  // TODO !
  const membersToSelect = React.useMemo(() => {
    return membersWithoutAcl.map(m => ({
      label: m.displayName || 'Anonymous',
      value: m.id || 0,
    }));
  }, [membersWithoutAcl]);

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
                API.setMemberInvolvement({
                  memberId: mId,
                  involvement: 'CONSULTED_READWRITE',
                  cardId: cardId,
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

interface AssignmentsOnCardPanelProps {
  cardId: number;
  readOnly?: boolean;
}

export default function AssignmentsOnCardPanel({
  cardId,
  readOnly,
}: AssignmentsOnCardPanelProps): JSX.Element {
  const { status: statusMembers, members: membersWithAcl } = useTeamMembersHavingAcl(cardId);
  // Note : ACLs are loaded when fetching the members having ACLs

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
          {membersWithAcl.map(member => {
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
