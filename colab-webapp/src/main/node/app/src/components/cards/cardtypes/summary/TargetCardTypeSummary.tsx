/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useProject } from '../../../../selectors/projectSelector';
import { CardTypeAllInOne as CardType } from '../../../../types/cardTypeDefinition';
import { space_S } from '../../../styling/style';

const referenceIcon = faCircleDot;

const targetProjectIconStyle = css({
  fontSize: '.8rem',
  marginRight: space_S,
  marginBottom: space_S,
})
interface TargetCardTypeSummaryProps {
  cardType: CardType;
}

export default function TargetCardTypeSummary({
  cardType,
}: TargetCardTypeSummaryProps): JSX.Element {
  return (
    <>
      {cardType.kind === 'referenced' &&
        (cardType.projectIdCT ? (
          <TargetProjectSummary projectId={cardType.projectIdCT} />
        ) : (
          <FontAwesomeIcon icon={referenceIcon} color={'var(--secondaryColor)'} title="It is a global type" className={targetProjectIconStyle} />
        ))}
    </>
  );
}

interface TargetProjectSummaryProps {
  projectId: number;
}

function TargetProjectSummary({ projectId }: TargetProjectSummaryProps): JSX.Element {
  const { project, status } = useProject(projectId);

  return (
    <FontAwesomeIcon
      icon={referenceIcon}
      className={targetProjectIconStyle}
      color={'var(--lightGray)'}
      title={
        status === 'INITIALIZED' && project?.name
          ? 'It comes from the project "' + project.name + '"'
          : 'It comes from a project'
      }
    />
  );
}
