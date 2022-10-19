/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

//import { css } from '@emotion/css';
//import { entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useProject } from '../../selectors/projectSelector';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import { WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';

interface ProjectSharingProps {
  projectId: number;
}

export default function ProjectSharing({ projectId }: ProjectSharingProps): JSX.Element {
  const i18n = useTranslations();

  const { project, status } = useProject(projectId);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <WIPContainer>
      <Flex>
        <h2>{i18n.modules.project.labels.shareTheProject}</h2>
      </Flex>
    </WIPContainer>
  );
}