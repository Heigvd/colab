/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { dispatch } from '../../store/store';
import { LabeledInput, LabeledTextArea } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import { ProjectIllustrationMaker } from './ProjectIllustrationMaker';

interface ProjectDisplaySettingsProps {
  project: Project;
}
// Display one project and allow to edit it
export function ProjectDisplaySettings({ project }: ProjectDisplaySettingsProps): JSX.Element {
  const i18n = useTranslations();
  return (
    <Flex align="stretch" direction="column" className={css({ alignSelf: 'stretch' })}>
      <LabeledInput
        label={i18n.common.name}
        placeholder={i18n.modules.project.actions.newProject}
        value={project.name || ''}
        onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
      />
      <LabeledTextArea
        label={i18n.common.description}
        placeholder={i18n.common.info.writeDescription}
        value={project.description || ''}
        onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
      />
      <ProjectIllustrationMaker
        illustration={project.illustration}
        setIllustration={i =>
          dispatch(
            API.updateProject({
              ...project,
              illustration: i,
            }),
          )
        }
      />
    </Flex>
  );
}
