/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faAnchor } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useProject } from '../../../../selectors/projectSelector';
import { CardTypeAllInOne as CardType } from '../../../../types/cardTypeDefinition';

const referenceIcon = faAnchor;

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
          <FontAwesomeIcon icon={referenceIcon} title="It is a global type" />
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
      title={
        status === 'INITIALIZED' && project?.name
          ? 'It comes from the project "' + project.name + '"'
          : 'It comes from a project'
      }
    />
  );
}
