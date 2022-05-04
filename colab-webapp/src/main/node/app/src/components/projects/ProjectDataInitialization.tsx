/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import Form, { Field } from '../common/Form/Form';
import ProjectModelThumbnail from './ProjectModelThumbnail';

{
  /* TODO work in progress UI */
}

interface ProjectDataInitializationProps {
  projectModel: Project | null;
}

// TODO work in progress : see if we use directly ProjectCreationBean
export interface InitialProjectData {
  name: string;
  description: string;
  guests: string[];
}

const defaultValue: InitialProjectData = {
  name: '',
  description: '',
  guests: [],
};

export default function ProjectDataInitialization({
  projectModel,
}: ProjectDataInitializationProps): JSX.Element {
  const dispatch = useAppDispatch();

  const formFields: Field<InitialProjectData>[] = [
    {
      key: 'name',
      type: 'text',
      label: 'Project name',
      isMandatory: true,
      readonly: false,
    },
    {
      key: 'description',
      type: 'text',
      label: 'Description',
      isMandatory: false,
      readonly: false,
    },
    // {key: 'description', type: 'textarea', label: 'description',},
    // {
    // readonly:true,
    // },
  ];

  const onSubmitCb = React.useCallback(
    (_data: InitialProjectData) => {
      dispatch(API.createProject(/* TODO data */));
      // TODO
    },
    [dispatch],
  );

  return (
    <Flex>
      <Flex>
        <Form
          fields={formFields}
          value={defaultValue}
          autoSubmit={false}
          submitLabel="Create project"
          onSubmit={onSubmitCb}
        ></Form>
      </Flex>
      {projectModel ? (
        <Flex>
          <ProjectModelThumbnail projectModel={projectModel} />
        </Flex>
      ) : (
        <div>no model</div>
      )}
    </Flex>
  );
}
