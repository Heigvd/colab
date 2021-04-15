/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'colab-rest-client';
import { css } from '@emotion/css';
import { iconButton, buttonStyle } from '../styling/style';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import { Destroyer } from '../common/Destroyer';
import { InlineLink } from '../common/Link';
import { AsyncThunk } from '@reduxjs/toolkit';
import { StateStatus } from '../../store/project';
import AutoSaveInput from '../common/AutoSaveInput';
import AutoSaveTextEditor from '../common/AutoSaveTextEditor';

interface Props {
  project: Project;
}

// Display one project and allow to edit its name
const ProjectDisplay = ({ project }: Props) => {
  const dispatch = useAppDispatch();
  return (
    <div
      className={css({
        margin: '20px',
        width: 'max-content',
        border: '1px solid grey',
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderBottom: '1px solid grey',
        })}
      >
        <span className={css({})}>
          Project #{project.id}
          <AutoSaveInput
            value={project.name || ''}
            onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
          />
        </span>
      </div>
      <div
        className={css({
          margin: '10px',
        })}
      >
        <AutoSaveTextEditor
          value={project.description || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
        />
        <InlineLink to={`/team/${project.id}`}>
          <FontAwesomeIcon icon={faUsers} />
        </InlineLink>
        <Destroyer
          onDelete={() => {
            dispatch(API.deleteProject(project));
          }}
        />
      </div>
    </div>
  );
};

interface ProjectListProps {
  projects: Project[];
  status: StateStatus;
  reload: AsyncThunk<Project[], void, {}>;
}

function ProjectList({ projects, status, reload }: ProjectListProps) {
  const dispatch = useAppDispatch();

  if (status === 'NOT_SET') {
    dispatch(reload());
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else {
    return (
      <div>
        <div>
          {projects
            .sort((a, b) => (a.id || 0) - (b.id || 0))
            .map(project => (
              <ProjectDisplay key={project.id} project={project} />
            ))}
        </div>
        <div>
          <span
            className={buttonStyle}
            onClick={() => {
              dispatch(
                API.createProject({
                  '@class': 'Project',
                  name: '',
                }),
              );
            }}
          >
            <FontAwesomeIcon className={iconButton} icon={faPlus} />
            New project
          </span>
        </div>
      </div>
    );
  }
}

export const UserProjects = () => {
  const projects = useAppSelector(state =>
    state.projects.mine.map(projectId => state.projects.projects[projectId]),
  );

  const status = useAppSelector(state => state.projects.status);

  return <ProjectList projects={projects} status={status} reload={API.getUserProjects} />;
};

export const AllProjects = () => {
  const projects = useAppSelector(state => Object.values(state.projects.projects));
  const status = useAppSelector(state => state.projects.allStatus);

  return <ProjectList projects={projects} status={status} reload={API.getAllProjects} />;
};
