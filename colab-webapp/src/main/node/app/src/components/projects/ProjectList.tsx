/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCog, faCopy, faEdit, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Project } from 'colab-rest-client';
import * as React from 'react';
//import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import { StateStatus } from '../../store/project';
import ItemThumbnailsSelection from '../common/collection/ItemThumbnailsSelection';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import InlineLoading from '../common/element/InlineLoading';
import ConfirmDeleteModal from '../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import {
  ellipsis,
  errorColor,
  fixedButtonStyle,
  lightIconButtonStyle,
  multiLineEllipsis,
  space_M,
  space_S,
  textSmall,
  voidStyle,
} from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';
import ProjectCreator from './ProjectCreator';
import { ProjectDisplaySettings } from './ProjectDisplaySettings';

const projectListStyle = css({
  margin: 'auto',
  width: '100%',
  display: 'inline-grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gridColumnGap: '40px',
  gridRowGap: '40px',
});

interface ProjectDisplayProps {
  project: Project;
}

// Display one project and allow to edit it
const ProjectDisplay = ({ project }: ProjectDisplayProps) => {
  const dispatch = useAppDispatch();
  return (
    <Flex direction="column" align="stretch">
      <Flex
        className={css({
          height: '80px',
        })}
      >
        <IllustrationDisplay illustration={project.illustration || defaultProjectIllustration} />
      </Flex>
      <div
        className={cx(
          css({
            display: 'flex',
            flexDirection: 'column',
            height: '100px',
          }),
        )}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: space_M,
            paddingRight: space_M,
            paddingTop: space_M,
            paddingBottom: space_S,
          })}
        >
          <h3 className={ellipsis} title={project.name ? project.name : 'Project name'}>
            {project.name}
          </h3>
          <DropDownMenu
            icon={faEllipsisV}
            valueComp={{ value: '', label: '' }}
            buttonClassName={cx(css({ marginLeft: '40px' }), lightIconButtonStyle)}
            entries={[
              {
                value: 'open',
                label: (
                  <>
                    <FontAwesomeIcon icon={faEdit} /> Open
                  </>
                ),
                action: () => window.open(`#/editor/${project.id}`, '_blank'),
              },
              {
                value: 'display settings',
                label: (
                  <OpenCloseModal
                    title="Project display settings"
                    showCloseButton
                    className={css({
                      '&:hover': { textDecoration: 'none' },
                      display: 'flex',
                      alignItems: 'center',
                    })}
                    collapsedChildren={
                      <div className={modalEntryStyle}>
                        <FontAwesomeIcon icon={faCog} />
                        Settings
                      </div>
                    }
                    widthMax
                    heightMax
                  >
                    {() => (
                      <ProjectDisplaySettings project={project} key={project.id} />
                    )}
                  </OpenCloseModal>
                ),
                modal: true,
              },
              {
                value: 'Duplicate project',
                label: (
                  <>
                    <FontAwesomeIcon icon={faCopy} /> Duplicate
                  </>
                ),
                action: () => dispatch(API.duplicateProject(project)),
              },
              {
                value: 'Delete project',
                label: (
                  <ConfirmDeleteModal
                    buttonLabel={
                      <div className={cx(css({ color: errorColor }), modalEntryStyle)}>
                        <FontAwesomeIcon icon={faTrash} /> Delete project
                      </div>
                    }
                    className={css({
                      '&:hover': { textDecoration: 'none' },
                      display: 'flex',
                      alignItems: 'center',
                    })}
                    message={
                      <p>
                        Are you <strong>sure</strong> you want to delete the whole project? This
                        will delete all cards inside.
                      </p>
                    }
                    onConfirm={() => dispatch(API.deleteProject(project))}
                    confirmButtonLabel="Delete project"
                  />
                ),
                modal: true,
              },
            ]}
          />
        </div>
        <div
          className={css({
            padding: space_M,
            paddingTop: 0,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          })}
        >
          <div title={project.description || ''} className={cx(multiLineEllipsis, textSmall)}>
            {project.description}
          </div>
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
      </div>
    </Flex>
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
        {(!projects || projects.length === 0) && (
          <div className={voidStyle}>
            <h2>Welcome ! </h2>
            <h3>You don't have any project yet</h3>
          </div>
        )}
        {/* {projects
            .sort((a, b) => (a.id || 0) - (b.id || 0))
            .map(project => {
              if (project != null) {
                return <ProjectDisplay key={project.id} project={project} />;
              } else {
                return <InlineLoading />;
              }
            })} */}
        <ItemThumbnailsSelection<Project>
          items={projects.sort((a, b) => (a.id || 0) - (b.id || 0))}
          className={projectListStyle}
          thumbnailClassName={css({
            padding: 0,
            margin: '4px',
            display: 'block',
            backgroundColor: 'var(--bgColor)',
          })}
          onItemDblClick={item => {
            if (item) {
              window.open(`#/editor/${item.id}`, '_blank');
            }
          }}
          fillThumbnail={item => {
            if (item === null) return <></>;
            else return <ProjectDisplay project={item} />;
          }}
          disableOnEnter
        />
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
