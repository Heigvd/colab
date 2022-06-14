/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faEdit, faEllipsisV, faTrash, faUmbrella } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Project } from 'colab-rest-client';
import * as React from 'react';
//import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import { StateStatus } from '../../store/project';
import Button from '../common/Button';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import InlineInputNew from '../common/InlineInputNew';
import InlineLoading from '../common/InlineLoading';
import {
  cardStyle,
  errorColor,
  fixedButtonStyle,
  invertedButtonStyle,
  localTitleStyle,
  space_M,
} from '../styling/style';
import ProjectCreator from './ProjectCreator';

const projectListStyle = css({
  margin: 'auto',
  width: '100%',
  display: 'inline-grid',
  gridTemplateColumns: 'repeat(3, minmax(250px, 1fr))',
  gridColumnGap: '40px',
  gridRowGap: '40px',
});

interface ProjectDisplayProps {
  project: Project;
}

// Display one project and allow to edit it
const ProjectDisplay = ({ project }: ProjectDisplayProps) => {
  const dispatch = useAppDispatch();
  //const navigate = useNavigate();

  return (
    <div
      className={cx(
        cardStyle,
        css({
          display: 'flex',
          flexDirection: 'column',
        }),
      )}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: space_M,
        })}
      >
        <InlineInputNew
          value={project.name || ''}
          placeholder="New project"
          onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
          className={localTitleStyle}
          maxWidth="80%"
        />
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          buttonClassName={css({ marginLeft: '40px' })}
          entries={[
            {
              value: 'edit',
              label: (
                <>
                  {' '}
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </>
              ),
              //action: () => navigate(`/editor/${project.id}`),
              action: () => window.open(`#/editor/${project.id}`, '_blank'),
            },
            {
              value: 'Duplicate project',
              label: (
                <>
                  {' '}
                  <FontAwesomeIcon icon={faUmbrella} /> Duplicate
                </>
              ),
              action: () => dispatch(API.duplicateProject(project)),
            },
            {
              value: 'Delete project',
              label: (
                <ConfirmDeleteModal
                  buttonLabel={
                    <div className={css({color: errorColor })}>
                      <FontAwesomeIcon icon={faTrash}/> Delete
                    </div>
                  }
                  message={
                    <p>
                      Are you <strong>sure</strong> you want to delete the whole project? This will
                      delete all cards inside.
                    </p>
                  }
                  onConfirm={() => dispatch(API.deleteProject(project))}
                  confirmButtonLabel="Delete project"
                />
              ),
            },
          ]}
        />
      </div>
      <div
        className={css({
          padding: space_M,
          paddingTop: 0,
          borderBottom: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        })}
      >
        <InlineInputNew
          value={project.description || ''}
          placeholder="Fill the description"
          onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
          inputType="textarea"
          className={css({
            maxWidth: '100%',
            minWidth: '100%',
            minHeight: '100px',
            maxHeight: '100px',
          })}
        />
        {/* 
        //FUTURE block of infos on the project
        <div
          className={css({
            fontSize: '0.8em',
            opacity: 0.4,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            marginTop: space_M,
          })}
        >
          <p className={cardInfoStyle}>Number of Cards?</p>
          <p className={cardInfoStyle}>Created by: {project.trackingData?.createdBy} </p>
          <p className={cardInfoStyle}>Number of people involved?</p>
          <p className={cardInfoStyle}>Last update: {project.trackingData?.modificationDate}</p>
        </div> */}
      </div>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: space_M,
        })}
      >
        <Button
          icon={faEdit}
          //onClick={() => navigate(`/editor/${project.id}`)}
          onClick={() => window.open(`#/editor/${project.id}`, '_blank')}
          className={cx(css({ margin: 'auto' }), invertedButtonStyle)}
        >
          Edit
        </Button>
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
      <div className={css({ padding: '4vw' })}>
        <div className={projectListStyle}>
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
        {/* Note : any authenticated user can create a project */}
        <ProjectCreator collapsedButtonClassName={fixedButtonStyle} />
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

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  return <ProjectList projects={projects} status={status} reload={API.getUserProjects} />;
};

export const AllProjects = (): JSX.Element => {
  const projects = useAppSelector(state => Object.values(state.projects.projects), shallowEqual);
  const status = useAppSelector(state => state.projects.allStatus);

  return <ProjectList projects={projects} status={status} reload={API.getAllProjects} />;
};
