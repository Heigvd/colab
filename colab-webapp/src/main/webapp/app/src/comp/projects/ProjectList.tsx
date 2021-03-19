/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';

import { Destroyer } from '../Destroyer';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'colab-rest-client';
import { css } from '@emotion/css';
import { AutoSaveTextEditor } from '../AutoSaveTextEditor';
import { iconButton } from '../style';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../../InlineLoading';

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
        <span className={css({})}>Project #{project.id}</span>
      </div>
      <div
        className={css({
          margin: '10px',
        })}
      >
        <AutoSaveTextEditor
          value={project.name || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
        />
        <Destroyer
          onDelete={() => {
            dispatch(API.deleteProject(project));
          }}
        />
      </div>
    </div>
  );
};

export function ProjectList() {
  const status = useAppSelector(state => state.projects.status);
  const projects = useAppSelector(state => Object.values(state.projects.projects));
  const dispatch = useAppDispatch();

  if (status === 'UNSET') {
    dispatch(API.initProjects());
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
            className={css({ cursor: 'Pointer' })}
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
