/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { ColabState, TDispatch } from '../store';
import * as API from '../API';

import { connect } from 'react-redux';

import { Destroyer } from './Destroyer';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'colab-rest-client';
import { css } from '@emotion/css';
import { AutoSaveTextEditor } from './AutoSaveTextEditor';
import { iconButton } from './style';

interface StateProps {}

interface DispatchProps {
  saveProject: (project: Project) => void;
  deleteProject: (project: Project) => void;
}

interface OwnProps {
  project: Project;
}

type Props = StateProps & DispatchProps & OwnProps;

// Display one project and allow to edit its name
const ProjectDisplayInternal = ({ project, saveProject, deleteProject }: Props) => {
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
          onChange={newValue => saveProject({ ...project, name: newValue })}
        />
        <Destroyer
          onDelete={() => {
            deleteProject(project);
          }}
        />
      </div>
    </div>
  );
};

// Link props to state & store
export const ProjectDisplay = connect<StateProps, DispatchProps, OwnProps, ColabState>(
  _state => ({}),
  (dispatch: TDispatch) => ({
    saveProject: (project: Project) => {
      dispatch(API.updateProject(project));
    },
    deleteProject: (project: Project) => {
      dispatch(API.updateProject(project));
    },
  }),
)(ProjectDisplayInternal);

interface ListStateProps {
  projects: Project[];
}

interface ListDispatchProps {
  createProject: (project: Project) => void;
}

interface ListOwnProps {}

type ListProps = ListStateProps & ListDispatchProps & ListOwnProps;

function InternalProjectListDisplay({ projects, createProject }: ListProps) {
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
            createProject({
              '@class': 'Project',
              name: '',
            });
          }}
        >
          <FontAwesomeIcon className={iconButton} icon={faPlus} />
          New project
        </span>
      </div>
    </div>
  );
}

/**
 * Display big fat + button to create a new project and the list of all existing project
 */
export const ProjectList = connect<ListStateProps, ListDispatchProps, ListOwnProps, ColabState>(
  state => ({
    projects: Object.values(state.projects),
  }),
  (dispatch: TDispatch) => ({
    createProject: (project: Project) => {
      dispatch(API.createProject(project));
    },
  }),
)(InternalProjectListDisplay);
