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
import Flex from '../common/Flex';
import Input from '../common/Form/Input';

interface ProjectDisplaySettingsProps {
  project: Project;
}

// Display one project and allow to edit it
export function ProjectDisplaySettings({ project }: ProjectDisplaySettingsProps): JSX.Element {
  //const navigate = useNavigate();
  return (
    <Flex align="stretch" direction="column" grow={1} className={css({ alignSelf: 'stretch' })}> 
          <Input
            label="Name"
            placeholder="New project"
            value={project.name || ''}
            onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
          />
          <Input
            label="Description"
            inputType="textarea"
            placeholder="Write a description here"
            value={project.description || ''}
            onChange={newValue =>
              dispatch(API.updateProject({ ...project, description: newValue }))
            }
          />
    </Flex>
  );
}
