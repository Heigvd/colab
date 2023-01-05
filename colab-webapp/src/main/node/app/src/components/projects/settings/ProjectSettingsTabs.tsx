/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
//import { CSVLink } from 'react-csv';
import useTranslations from '../../../i18n/I18nContext';
import { useProject } from '../../../selectors/projectSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import { TipsCtx, WIPContainer } from '../../common/element/Tips';
import Flex from '../../common/layout/Flex';
import Tabs, { Tab } from '../../common/layout/Tabs';
import { space_L } from '../../styling/style';
import ProjectSettingsAdvanced from './ProjectSettingsAdvanced';
import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ProjectSettingsModelSharing from './ProjectSettingsSharing';

interface ProjectSettingsTabsProps {
  projectId: number;
}

export function ProjectSettingsTabs({ projectId }: ProjectSettingsTabsProps): JSX.Element {
  const i18n = useTranslations();

  const tipsConfig = React.useContext(TipsCtx);

  const { project, status } = useProject(projectId);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex
      align="stretch"
      direction="column"
      grow={1}
      className={css({ alignSelf: 'stretch', padding: space_L })}
    >
      <Tabs routed>
        <Tab name="general" label={i18n.common.general}>
          <ProjectSettingsGeneral projectId={projectId} />
        </Tab>
        <Tab
          name="share"
          label={i18n.modules.project.labels.sharing}
          invisible={project.type !== 'MODEL'}
        >
          <ProjectSettingsModelSharing projectId={projectId} />
        </Tab>
        <Tab name="advanced" label={i18n.common.advanced} invisible={!tipsConfig.WIP.value}>
          <WIPContainer>
            <ProjectSettingsAdvanced projectId={projectId} />
          </WIPContainer>
        </Tab>
      </Tabs>
    </Flex>
  );
}
