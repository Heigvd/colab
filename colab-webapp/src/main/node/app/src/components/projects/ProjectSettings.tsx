/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'colab-rest-client/dist/ColabClient';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { dispatch } from '../../store/store';
import Flex from '../common/Flex';
import Input from '../common/Form/Input';
import IconButton from '../common/IconButton';
import Tabs, { Tab } from '../common/Tabs';
import { space_M } from '../styling/style';
import Team from './Team';

interface ProjectSettingsProps {
  project: Project;
}

// Display one project and allow to edit it
export function ProjectSettings({ project }: ProjectSettingsProps): JSX.Element {
  const navigate = useNavigate();
  const projectId = project.id;
  return (
    <Flex align="stretch" direction="column" grow={1} className={css({ alignSelf: 'stretch' })}>
      <IconButton
        icon={faArrowLeft}
        title={'Back to project'}
        iconColor="var(--darkGray)"
        onClick={() => navigate('./editor/' + projectId)}
        className={css({ display: 'block', marginBottom: space_M })}
      />

      <h1>Project Settings</h1>
      <Tabs className={css({ flexGrow: 1 })} bodyClassName={css({ flexGrow: 1 })}>
        <Tab label="General" name="General">
          <Input
            label="Project name"
            placeholder="unnamed"
            value={project.name || ''}
            onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
          />
          <Input
            label="Project description"
            inputType="textarea"
            placeholder="Write a description here."
            value={project.description || ''}
            onChange={newValue =>
              dispatch(API.updateProject({ ...project, description: newValue }))
            }
          />
        </Tab>
        <Tab label="Team" name="Team">
          <Team project={project} />
        </Tab>
      </Tabs>
    </Flex>
  );
}
