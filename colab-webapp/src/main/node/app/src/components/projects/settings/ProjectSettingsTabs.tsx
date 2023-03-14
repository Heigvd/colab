/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
//import { CSVLink } from 'react-csv';
import useTranslations from '../../../i18n/I18nContext';
import { useCurrentUser } from '../../../selectors/userSelector';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import Tabs, { Tab } from '../../common/layout/Tabs';
import { space_xl } from '../../styling/style';
import ProjectSettingsAdvanced from './ProjectSettingsAdvanced';
import ProjectSettingsGeneral from './ProjectSettingsGeneral';
import ProjectSettingsModelSharing from './ProjectSettingsSharing';

interface ProjectSettingsTabsProps {
  project: Project;
}

export function ProjectSettingsTabs({ project }: ProjectSettingsTabsProps): JSX.Element {
  const i18n = useTranslations();
  const { currentUser } = useCurrentUser();

  if(project.id != null){
  return (
    <Flex
      align="stretch"
      direction="column"
      grow={1}
      className={css({ alignSelf: 'stretch', padding: space_xl })}
    >
      <Tabs routed>
        <Tab name="general" label={i18n.common.general}>
          <ProjectSettingsGeneral projectId={project.id} />
        </Tab>
        <Tab
          name="share"
          label={i18n.modules.project.labels.sharing}
          invisible={project.type !== 'MODEL'}
        >
          <ProjectSettingsModelSharing projectId={project.id} />
        </Tab>
        <Tab name="advanced" label={i18n.common.advanced} invisible={!currentUser?.admin}>
          <ProjectSettingsAdvanced projectId={project.id} />
        </Tab>
      </Tabs>
    </Flex>
  );
}
else{return(<InlineLoading />)};
}
