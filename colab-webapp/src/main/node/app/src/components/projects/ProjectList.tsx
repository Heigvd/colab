/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCog, faCopy, faEdit, faEllipsisV, faGlobe, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AsyncThunk } from '@reduxjs/toolkit';
import { entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProject } from '../../selectors/projectSelector';
import { shallowEqual, useAppDispatch, useAppSelector, useLoadingState } from '../../store/hooks';
import { StateStatus } from '../../store/slice/projectSlice';
import ItemThumbnailsSelection from '../common/collection/ItemThumbnailsSelection';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import InlineLoading from '../common/element/InlineLoading';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
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

const modelChipStyle = css({
 position: 'absolute', 
 top: 0, 
 right: 0,
 padding: '10px 10px 12px 12px',
 borderRadius: '0 0 0 50%',
 backgroundColor: 'var(--primaryColor)'
});
function ProjectSettingWrapper(): JSX.Element {
  const { projectId } = useParams<'projectId'>();
  const i18n = useTranslations();
  const project = useAndLoadProject(projectId ? +projectId : undefined);
  const navigate = useNavigate();

  return (
    <Modal
      title={i18n.modules.project.labels.projectDisplaySettings}
      showCloseButton
      onClose={() => {
        navigate('/');
      }}
      className={css({
        '&:hover': { textDecoration: 'none' },
        display: 'flex',
        width: '800px',
        height: '580px',
      })}
    >
      {() => {
        if (project.project != null) {
          return <ProjectDisplaySettings project={project.project} key={projectId} />;
        } else {
          return <InlineLoading />;
        }
      }}
    </Modal>
  );
}

function DeleteProjectWrapper(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { projectId } = useParams<'projectId'>();
  const i18n = useTranslations();
  const { project } = useAndLoadProject(projectId ? +projectId : undefined);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const onCancelCb = React.useCallback(() => {
    navigate('/');
  }, [navigate]);

  const onConfirmCb = React.useCallback(() => {
    if (project) {
      startLoading();
      dispatch(API.deleteProject(project)).then(() => {
        stopLoading();
        navigate('/');
      });
    }
  }, [dispatch, navigate, project, startLoading, stopLoading]);

  return (
    <ConfirmDeleteModal
      title={i18n.modules.project.actions.deleteProject}
      message={<p>{i18n.modules.project.info.deleteConfirmation}</p>}
      onCancel={onCancelCb}
      onConfirm={onConfirmCb}
      confirmButtonLabel={i18n.modules.project.actions.deleteProject}
      isConfirmButtonLoading={isLoading}
    />
  );
}

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
  className?: string;
  isModel?: boolean;
  isAdminModel?: boolean;
}

// Display one project and allow to edit it
export const ProjectDisplay = ({ project, className, isModel, isAdminModel }: ProjectDisplayProps) => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const navigate = useNavigate();

  return (
    <Flex
      onMouseDown={e => {
        // ultimate hack to open a project in the very same tab: use middle mouse button
        if (e.button === 1) {
          navigate(`/editor/${project.id}`);
        }
      }}
      direction="column"
      align="stretch"
      className={className}
    >
      <Flex
        className={css({
          height: '80px',
          position: 'relative',
        })}
      >
        {isModel && <Flex align='center' justify='center' className={modelChipStyle} title={i18n.modules.project.info.isAModel}>
          {isAdminModel ? <FontAwesomeIcon icon={faGlobe} color='white' size='sm'/> : <FontAwesomeIcon icon={faStar} color='white' size='sm'/>
          }
        </Flex>}
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
                    <FontAwesomeIcon icon={faEdit} /> {i18n.common.open}
                  </>
                ),
                action: () => window.open(`#/editor/${project.id}`, '_blank'),
              },
              {
                value: 'settings',
                label: (
                  <>
                    <FontAwesomeIcon icon={faCog} /> {i18n.common.settings}
                  </>
                ),
                action: () => navigate(`projectsettings/${project.id}`),
              },
              {
                value: 'duplicate',
                label: (
                  <>
                    <FontAwesomeIcon icon={faCopy} /> {i18n.common.duplicate}
                  </>
                ),
                action: () => dispatch(API.duplicateProject(project)),
              },
              {
                value: 'delete',
                label: (
                  <>
                    <FontAwesomeIcon icon={faTrash} color={errorColor} /> {i18n.common.delete}
                  </>
                ),
                action: () => navigate(`deleteproject/${project.id}`),
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
  const i18n = useTranslations();
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
            <h2>{i18n.common.welcome}</h2>
            <h3>{i18n.modules.project.info.noProjectYet}</h3>
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
        <Routes>
          <Route path="projectsettings/:projectId" element={<ProjectSettingWrapper />} />
          <Route path="deleteproject/:projectId" element={<DeleteProjectWrapper />} />
        </Routes>
      </div>
    );
  }
}

export const UserProjects = (): JSX.Element => {
  const projects = useAppSelector(
    state =>
      state.projects.mine.flatMap(projectId => {
        const p = state.projects.projects[projectId];
        if (entityIs(p, 'Project')) {
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
  const projects = useAppSelector(
    state =>
      Object.values(state.projects.projects).flatMap(p => {
        if (entityIs(p, 'Project')) {
          return [p];
        } else {
          return [];
        }
      }),
    shallowEqual,
  );
  const status = useAppSelector(state => state.projects.allStatus);

  return <ProjectList projects={projects} status={status} reload={API.getAllProjects} />;
};

export const UserModels = (): JSX.Element => {
  const status = useAppSelector(state => state.projects.status);

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  return <ModelsList status={status} reload={API.getUserProjects} />;
};

interface ModelListProps {
  status: StateStatus;
  // eslint-disable-next-line @typescript-eslint/ban-types
  reload: AsyncThunk<Project[], void, {}>;
}
 function ModelsList({ status, reload }: ModelListProps) {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const models = useAppSelector(
    state =>
      Object.values(state.projects.projects).flatMap(p => {
        // ADD TEST IF p == model
        if (entityIs(p, 'Project')) {
          return [p];
        } else {
          return [];
        }
      }),
    shallowEqual,
  );
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
        {(!models || models.length === 0) && (
          <div className={voidStyle}>
            <h2>{i18n.common.welcome}</h2>
            <h3>{i18n.modules.project.info.noProjectYet}</h3>
          </div>
        )}
        <ItemThumbnailsSelection<Project>
          items={models.sort((a, b) => (a.id || 0) - (b.id || 0))}
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
            else return <ProjectDisplay project={item} isModel className={css({boxShadow: ` 0px -5px 0px 0px ${item.illustration?.iconBkgdColor} inset`,})} />;
          }}
          disableOnEnter
        />
        {/* Note : any authenticated user can create a project */}
        {/* <ProjectCreator collapsedButtonClassName={fixedButtonStyle} /> */}
        <Routes>
          <Route path="projectsettings/:projectId" element={<ProjectSettingWrapper />} />
          <Route path="deleteproject/:projectId" element={<DeleteProjectWrapper />} />
        </Routes>
      </div>
    );
  }
}