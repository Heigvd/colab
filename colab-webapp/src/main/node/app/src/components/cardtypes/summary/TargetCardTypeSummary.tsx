/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useProject } from '../../../store/selectors/projectSelector';
import { MaterialIconsType } from '../../../styling/IconType';
import { space_sm } from '../../../styling/style';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import Icon from '../../common/layout/Icon';

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
            icon={'language'}
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
    <Icon
      icon={project?.illustration?.iconKey as MaterialIconsType}
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
