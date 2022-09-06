/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { faCircleDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useTranslations from '../../../../i18n/I18nContext';
import { useProject } from '../../../../selectors/projectSelector';
import { CardTypeAllInOne as CardType } from '../../../../types/cardTypeDefinition';
import { space_S } from '../../../styling/style';

const referenceIcon = faCircleDot;

const targetProjectIconStyle = css({
  fontSize: '.8rem',
  marginRight: space_S,
  marginBottom: space_S,
});
interface TargetCardTypeSummaryProps {
  cardType: CardType;
}

export default function TargetCardTypeSummary({
  cardType,
}: TargetCardTypeSummaryProps): JSX.Element {
  const i18n = useTranslations();
  return (
    <>
      {cardType.kind === 'referenced' &&
        (cardType.projectIdCT ? (
          <TargetProjectSummary projectId={cardType.projectIdCT} />
        ) : (
          <FontAwesomeIcon
            icon={referenceIcon}
            color={'var(--secondaryColor)'}
            title={i18n.modules.cardType.info.isGlobalType}
            className={targetProjectIconStyle}
          />
        ))}
    </>
  );
}

interface TargetProjectSummaryProps {
  projectId: number;
}

function TargetProjectSummary({ projectId }: TargetProjectSummaryProps): JSX.Element {
  const { project, status } = useProject(projectId);
  const i18n = useTranslations();

  return (
    <FontAwesomeIcon
      icon={
        project?.illustration
          ? {
              prefix: project.illustration.iconLibrary === 'FONT_AWESOME_REGULAR' ? 'far' : 'fas',
              iconName: project.illustration.iconKey as IconName,
            }
          : referenceIcon
      }
      className={targetProjectIconStyle}
      color={project?.illustration ? project.illustration.iconBkgdColor : 'var(--lightGray)'}
      title={
        status === 'INITIALIZED' && project?.name
          ? i18n.modules.cardType.info.fromProject(project.name)
          : i18n.modules.cardType.info.fromAProject
      }
    />
  );
}
