/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../../i18n/I18nContext';
import { useProject } from '../../../../selectors/projectSelector';
import { CardTypeAllInOne as CardType } from '../../../../types/cardTypeDefinition';
import Icon from '../../../common/layout/Icon';
import { space_sm } from '../../../styling/style';

export const referenceIcon = 'star';

export const targetProjectIconStyle = css({
  fontSize: '.8rem',
  marginRight: space_sm,
  marginBottom: space_sm,
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
           <Icon
            icon={'globe'}
            color={'var(--primary-main)'}
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
  const { project } = useProject(projectId);
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
      color={project?.illustration ? project.illustration.iconBkgdColor : 'var(--divider-main)'}
      title={
        entityIs(project, 'Project') && project?.name
          ? i18n.modules.cardType.info.fromProject(project.name)
          : i18n.modules.cardType.info.fromAProject
      }
    />
  );
}
