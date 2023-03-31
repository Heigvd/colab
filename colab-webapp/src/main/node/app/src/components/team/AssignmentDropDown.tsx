/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { InvolvementLevel } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useAssignmentForCardAndMember } from '../../store/selectors/assignmentSelector';
import { ghostIconButtonStyle, heading_md, iconButtonStyle } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';

////////////////////////////////////////////////////////////////////////////////////////////////////
// different involvement levels
////////////////////////////////////////////////////////////////////////////////////////////////////

const noInvolvementLevel = 'noLevel';

type InvolvementLevelOrNot = InvolvementLevel | typeof noInvolvementLevel;

function LabelPrettyPrint({
  involvementLevel,
}: {
  involvementLevel: InvolvementLevelOrNot;
}): JSX.Element {
  const i18n = useTranslations();

  switch (involvementLevel) {
    case 'RESPONSIBLE':
      return <>{'R (' + i18n.team.assignment.labels.responsible + ')'}</>;
    case 'ACCOUNTABLE':
      return <>{'A (' + i18n.team.assignment.labels.accountable + ')'}</>;
    case 'SUPPORT':
      return <>{'S (' + i18n.team.assignment.labels.support + ')'}</>;
    default:
      return <>{' - (' + i18n.common.none.toLowerCase() + ')'}</>;
  }
}

function buttonPrettyPrint(involvementLevel: InvolvementLevelOrNot): JSX.Element {
  switch (involvementLevel) {
    case 'RESPONSIBLE':
      return <>R</>;
    case 'ACCOUNTABLE':
      return <>A</>;
    case 'SUPPORT':
      return <>S</>;
    default:
      return <Icon icon={'remove'} opsz="xs" />;
  }
}

function buildOption(involvementLevel: InvolvementLevelOrNot) {
  return {
    value: involvementLevel,
    label: <LabelPrettyPrint involvementLevel={involvementLevel} />,
  };
}

const options = [
  buildOption('RESPONSIBLE'),
  buildOption('ACCOUNTABLE'),
  buildOption('SUPPORT'),
  buildOption(noInvolvementLevel),
];

////////////////////////////////////////////////////////////////////////////////////////////////////
// drop down
////////////////////////////////////////////////////////////////////////////////////////////////////

interface AssignmentDropDownProps {
  cardId: number | undefined | null;
  memberId: number | undefined | null;
}

export default function AssignmentDropDown({
  cardId,
  memberId,
}: AssignmentDropDownProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { status, assignment } = useAssignmentForCardAndMember(cardId, memberId);

  const onChange = React.useCallback(
    (value: InvolvementLevelOrNot) => {
      if (memberId != null && cardId != null) {
        if (value != null && value != noInvolvementLevel) {
          dispatch(
            API.setAssignment({
              cardId: cardId,
              memberId: memberId,
              involvementLevel: value,
            }),
          );
        } else {
          dispatch(API.removeAssignmentLevel({ cardId, memberId }));
        }
      }
    },
    [cardId, memberId, dispatch],
  );

  const onChangeCb = React.useCallback(
    (option: { value: InvolvementLevelOrNot } | null) => {
      if (option != null) {
        onChange(option.value);
      } else {
        onChange(noInvolvementLevel);
      }
    },
    [onChange],
  );

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex direction="column" align="stretch">
      <DropDownMenu
        value={assignment?.involvementLevel || noInvolvementLevel}
        entries={options}
        onSelect={entry => onChangeCb(entry)}
        className={css({ alignItems: 'stretch' })}
        buttonLabel={buttonPrettyPrint(assignment?.involvementLevel || noInvolvementLevel)}
        buttonClassName={cx(
          heading_md,
          iconButtonStyle,
          ghostIconButtonStyle,
          css({
            justifyContent: 'center',
            lineHeight: '24px',
            color: 'var(--primary-main)',
            backgroundColor: 'transparent',
          }),
        )}
      />
    </Flex>
  );
}
