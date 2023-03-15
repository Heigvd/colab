/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { InvolvementLevel } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import logger from '../../../logger';
import { useAclForCardAndMember } from '../../../selectors/assignmentSelector';
import { useAppDispatch } from '../../../store/hooks';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import DropDownMenu from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { ghostIconButtonStyle, heading_md, iconButtonStyle } from '../../styling/style';

////////////////////////////////////////////////////////////////////////////////////////////////////
// involvement different values
////////////////////////////////////////////////////////////////////////////////////////////////////

const noInvolvement = 'none';

type InvolvementLevelOrNot = InvolvementLevel | typeof noInvolvement;

function LabelPrettyPrint({ level }: { level: InvolvementLevelOrNot }): JSX.Element {
  const i18n = useTranslations();

  switch (level) {
    case 'RESPONSIBLE':
      return <>{'R (' + i18n.team.raci.responsible + ')'}</>;
    case 'ACCOUNTABLE':
      return <>{'A (' + i18n.team.raci.accountable + ')'}</>;
    case 'CONSULTED_READWRITE':
      return <>{'C (' + i18n.team.raci.support + ')'}</>;
    case 'INFORMED_READWRITE':
      return <>{'I (' + i18n.team.raci.support + ')'}</>;
    case 'OUT_OF_THE_LOOP':
      return <>{i18n.team.raci.accessDenied}</>;
    default:
      return <>{i18n.common.none}</>;
  }
}

function buttonPrettyPrint(level: InvolvementLevelOrNot): JSX.Element {
  switch (level) {
    case 'RESPONSIBLE':
      return <>R</>;
    case 'ACCOUNTABLE':
      return <>A</>;
    case 'CONSULTED_READWRITE':
      return <>C</>;
    case 'INFORMED_READWRITE':
      return <>I</>;
    case 'OUT_OF_THE_LOOP':
      return <Icon icon={'block'} />;
    default:
      return <Icon icon={'remove'} />;
  }
}

function buildOption(level: InvolvementLevelOrNot) {
  return {
    value: level,
    label: <LabelPrettyPrint level={level} />,
  };
}

const options = [
  buildOption('RESPONSIBLE'),
  buildOption('ACCOUNTABLE'),
  buildOption('CONSULTED_READWRITE'),
  buildOption('INFORMED_READWRITE'),
  buildOption('OUT_OF_THE_LOOP'),
  buildOption(noInvolvement),
];

////////////////////////////////////////////////////////////////////////////////////////////////////
// involvement values
////////////////////////////////////////////////////////////////////////////////////////////////////

interface MemberACLDropDownProps {
  cardId: number | undefined | null;
  memberId: number | undefined | null;
}

export default function MemberACLDropDown({
  cardId,
  memberId,
}: MemberACLDropDownProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { status, acl } = useAclForCardAndMember(cardId, memberId);

  const onChange = React.useCallback(
    (value: InvolvementLevelOrNot) => {
      logger.info('New role level: ', value);

      if (memberId != null && cardId != null) {
        if (value != null && value != noInvolvement) {
          dispatch(
            API.setMemberInvolvement({
              memberId: memberId,
              involvement: value,
              cardId: cardId,
            }),
          );
        } else {
          dispatch(API.clearMemberInvolvement({ memberId: memberId, cardId: cardId }));
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
        onChange(noInvolvement);
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
        value={acl?.cairoLevel}
        entries={options}
        onSelect={entry => onChangeCb(entry)}
        className={css({ alignItems: 'stretch' })}
        buttonLabel={buttonPrettyPrint(acl?.cairoLevel || noInvolvement)}
        buttonClassName={cx(
          heading_md,
          iconButtonStyle,
          ghostIconButtonStyle,
          css({ justifyContent: 'center', lineHeight: '24px', color: 'var(--primary-main)' }),
        )}
      />
    </Flex>
  );
}
