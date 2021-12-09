/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faEdit,
  faEllipsisV,
  faExclamationTriangle,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import { StateStatus } from '../../store/project';
import AutoSaveInput from '../common/AutoSaveInput';
import Button from '../common/Button';
import DropDownMenu from '../common/DropDownMenu';
import InlineLoading from '../common/InlineLoading';
import { InlineLink } from '../common/Link';
import OpenCloseModal from '../common/OpenCloseModal';
import { cardStyle, fixedButtonStyle, flex, space_M } from '../styling/style';

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
          padding: space_M,
        })}
      >
        <AutoSaveInput
          placeholder="unnamed"
          value={project.name || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
          className={css({ fontWeight: 'bold'})}
        />
        <DropDownMenu
          icon={faEllipsisV}
          valueComp={{ value: '', label: '' }}
          buttonClassName={css({marginLeft: '40px'})}
          entries={[
            {
              value: 'Delete project',
              label: (
                <>
                  <OpenCloseModal
                    title="Delete project"
                    collapsedChildren={
                      <div className={css({ pointerEvents: 'none' })}>
                        <FontAwesomeIcon icon={faTrash} /> Delete project
                      </div>
                    }
                  >
                    {collapse => (
                      <div>
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                        <p>
                          Are you <strong>sure</strong> you want to delete the whole project? This
                          will delete all cards inside.
                        </p>
                        <div className={flex}>
                          <Button label="Delete project" title="Confirm delete" onClick={()=>dispatch(API.deleteProject(project))}/>
                          <Button label="Cancel" title="Cancel delete" onClick={() => collapse()} />
                        </div>
                      </div>
                    )}
                  </OpenCloseModal>
                </>
              ),
            },
          ]}
        />
      </div>
      <div
        className={css({
          padding: space_M,
          paddingRight: '40px',
          borderBottom: '1px solid #ddd',
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
          padding: space_M,
        })}
      >
        <InlineLink to={`/editor/${project.id}`}>
          <Button
            title="Edit project"
            label={
              <>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </>
            }
            className={css({margin:'auto'})}
          />
        </InlineLink>
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
        <Button
          onClick={() => {
            dispatch(
              API.createProject({
                '@class': 'Project',
                name: '',
              }),
            );
          }}
          label={
            <>
              <FontAwesomeIcon icon={faPlus} /> Create new project
            </>
          }
          title={'Create new project'}
          className={fixedButtonStyle}
        />
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
