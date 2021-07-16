/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import { StateStatus } from '../../store/project';
import AutoSaveInput from '../common/AutoSaveInput';
import { Destroyer } from '../common/Destroyer';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import { InlineLink } from '../common/Link';
import { cardStyle } from '../styling/style';

interface Props {
  project: Project;
}

// Display one project and allow to edit it
const ProjectDisplay = ({ project }: Props) => {
  const dispatch = useAppDispatch();

  return (
    <div
      className={cx(
        cardStyle,
        css({
          margin: '20px',
          width: 'max-content',
        }),
      )}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '10px',
        })}
      >
        <span className={css({})}>Project #{project.id}</span>
        <AutoSaveInput
          placeholder="unnamed"
          value={project.name || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
        />
      </div>
      <div
        className={css({
          padding: '10px',
          borderTop: '1px solid grey',
          borderBottom: '1px solid grey',
        })}
      >
        <AutoSaveInput
          inputType="TEXTAREA"
          placeholder="no description"
          value={project.description || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
        />
      </div>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '10px',
        })}
      >
        <InlineLink to={`/editor/${project.id}`}>
          <IconButton title="Edit project" iconColor="var(--fgColor)" icon={faEdit} />
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
  // eslint-disable-next-line @typescript-eslint/ban-types
  reload: AsyncThunk<Project[], void, {}>;
}

function ProjectList({ projects, status, reload }: ProjectListProps) {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (status === 'NOT_INITIALIZED') {
      dispatch(reload());
    }
  }, [status, reload, dispatch]);

  if (status === 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else {
    return (
      <div>
        <div>
          {projects
            .sort((a, b) => (a.id || 0) - (b.id || 0))
            .map(project => {
              if (project != null) {
                return <ProjectDisplay key={project.id} project={project} />;
              } else {
                return <InlineLoading />;
              }
            })}
        </div>
        <div>
          <IconButton
            icon={faPlus}
            onClick={() => {
              dispatch(
                API.createProject({
                  '@class': 'Project',
                  name: '',
                }),
              );
            }}
          >
            Create a project
          </IconButton>
        </div>
      </div>
    );
  }
}

export const UserProjects = (): JSX.Element => {
  const projects = useAppSelector(
    state =>
      state.projects.mine.flatMap(projectId => {
        const p = state.projects.projects[projectId];
        if (p) {
          return [p];
        } else {
          return [];
        }
      }),
    shallowEqual,
  );

  const status = useAppSelector(state => state.projects.status);

  return <ProjectList projects={projects} status={status} reload={API.getUserProjects} />;
};

export const AllProjects = (): JSX.Element => {
  const projects = useAppSelector(state => Object.values(state.projects.projects), shallowEqual);
  const status = useAppSelector(state => state.projects.allStatus);

  return <ProjectList projects={projects} status={status} reload={API.getAllProjects} />;
};
