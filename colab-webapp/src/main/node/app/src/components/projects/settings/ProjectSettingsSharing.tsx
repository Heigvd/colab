/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useProject } from '../../../selectors/projectSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import { WIPContainer } from '../../common/element/Tips';
import Flex from '../../common/layout/Flex';
import { space_L } from '../../styling/style';
import ProjectModelSharingLinkModal from '../ProjectModelSharingLink';
import ProjectModelSharingMailModal from '../ProjectModelSharingMail';
import ProjectModelSharingParam from '../ProjectModelSharingParam';

export interface ProjectSettingsModelSharingProps {
  projectId: number;
}

export default function ProjectSettingsModelSharing({
  projectId,
}: ProjectSettingsModelSharingProps): JSX.Element {
  const i18n = useTranslations();

  const { project, status } = useProject(projectId);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex direction="column" className={css({ alignSelf: 'stretch' })}>
      <Flex className={css({ alignSelf: 'stretch' })}>
        <Flex
          direction="column"
          align="stretch"
          className={css({ width: '45%', minWidth: '45%', marginRight: space_L })}
        >
          <h2>{i18n.modules.project.labels.shareTheProject}</h2>
          <Flex direction="row" align="center" justify="space-evenly" grow={1}>
            <ProjectModelSharingMailModal projectId={projectId} />
            <WIPContainer>
              <ProjectModelSharingLinkModal projectId={projectId} />
            </WIPContainer>
          </Flex>
        </Flex>
        <Flex
          direction="column"
          align="stretch"
          justify="flex-end"
          className={css({ width: '55%' })}
        >
          <ProjectModelSharingParam projectId={projectId} />
        </Flex>
      </Flex>
    </Flex>
  );
}
