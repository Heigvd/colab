/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'colab-rest-client/dist/ColabClient';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { dispatch } from '../../store/store';
import ProjectCardTypeList from '../cards/cardtypes/ProjectCardTypeList';
import IconButton from '../common/element/IconButton';
import Input from '../common/Form/Input';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import { lightIconButtonStyle } from '../styling/style';
import Team from './Team';

interface ProjectSettingsProps {
  project: Project;
}

// Display one project and allow to edit it
export function ProjectSettings({ project }: ProjectSettingsProps): JSX.Element {
  const navigate = useNavigate();
  return (
    <Flex align="stretch" direction="column" grow={1} className={css({ alignSelf: 'stretch' })}>
      <Flex align="center">
        <IconButton
          icon={faArrowLeft}
          title={'Back to project'}
          onClick={() => navigate('../')}
          className={cx(css({ display: 'block' }), lightIconButtonStyle)}
        />
        <h2>Project settings</h2>
      </Flex>
      <Tabs>
        <Tab name="General" label="General">
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
        </Tab>
        <Tab name="Team" label="Team">
          <Team project={project} />
        </Tab>
        <Tab name="Card Types" label="Card Types">
          <ProjectCardTypeList />
        </Tab>
      </Tabs>
    </Flex>
  );
}
