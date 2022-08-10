/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Project } from 'colab-rest-client/dist/ColabClient';
import * as React from 'react';
import * as API from '../../API/api';
import { dispatch } from '../../store/store';
import { LabeledInput, LabeledTextArea } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import { ProjectIllustrationMaker } from './ProjectIllustrationMaker';

interface ProjectDisplaySettingsProps {
  project: Project;
}
// Display one project and allow to edit it
export function ProjectDisplaySettings({
  project,
}: ProjectDisplaySettingsProps): JSX.Element {
  return (
    <Flex align="stretch" direction="column" className={css({ alignSelf: 'stretch' })}>
      <LabeledInput
        label="Name"
        placeholder="New project"
        value={project.name || ''}
        onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
      />
      <LabeledTextArea
        label="Description"
        placeholder="Write a description here"
        value={project.description || ''}
        onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
      />
      <ProjectIllustrationMaker illustration={project.illustration} setIllustration={i => dispatch(
        API.updateProject({
          ...project,
          illustration: i,
        }),
      )} />
    </Flex>
  );
}
