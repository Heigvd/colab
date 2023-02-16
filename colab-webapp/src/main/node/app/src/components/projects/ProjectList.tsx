/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import {
  useAllProjectsAndModels,
  useMyModels,
  useMyProjects,
  useProject,
} from '../../selectors/projectSelector';
import { useCurrentUser } from '../../selectors/userSelector';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import ItemThumbnailsSelection from '../common/collection/ItemThumbnailsSelection';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import {
  br_xl,
  ellipsisStyle,
  lightIconButtonStyle,
  lightTextStyle,
  multiLineEllipsisStyle,
  p_0,
  p_lg,
  p_md,
  p_sm,
  space_sm,
  space_xl,
  text_sm,
} from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';
import ProjectCreator from './ProjectCreator';
import { ProjectModelExtractor } from './ProjectModelExtractor';
import { ProjectSettingsGeneralInModal } from './settings/ProjectSettingsGeneral';

const modelChipStyle = cx(
  p_sm,
  css({
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: '0 0 0 50%',
    backgroundColor: 'var(--text-primary)',
  }),
);

const projectCardStyle = cx(
  br_xl,
  p_0,
  css({
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
  }),
);

const projectListStyle = css({
  display: 'inline-grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
  gridColumnGap: space_xl,
  gridRowGap: space_xl,
});

function ProjectSettingsWrapper(): JSX.Element {
  const navigate = useNavigate();

  const { projectId } = useParams<'projectId'>();

  const projectIdAsNumber = projectId ? +projectId : undefined;

  if (projectIdAsNumber != null) {
    return (
      <ProjectSettingsGeneralInModal
        projectId={projectIdAsNumber}
        onClose={() => {
          navigate('..');
        }}
      />
    );
  }

  return <AvailabilityStatusIndicator status="ERROR" />;
}

function ExtractModelWrapper(): JSX.Element {
  const { projectId } = useParams<'projectId'>();

  return <ProjectModelExtractor projectId={+projectId!} />;
}

function DeleteProjectWrapper(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { projectId } = useParams<'projectId'>();
  const i18n = useTranslations();
  const { project } = useProject(+projectId!);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const onCancelCb = React.useCallback(() => {
    navigate('../');
  }, [navigate]);

  const onConfirmCb = React.useCallback(() => {
    if (project) {
      startLoading();
      dispatch(API.deleteProject(project)).then(() => {
        stopLoading();
        navigate('../');
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



interface ProjectDisplayProps {
  project: Project;
  className?: string;
}

// Display one project and allow to edit it
export const ProjectDisplay = ({ project, className }: ProjectDisplayProps) => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const navigate = useNavigate();

  const { currentUser } = useCurrentUser();

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
      className={cx(className)}
    >
      <Flex
        className={css({
          height: '70px',
          position: 'relative',
        })}
      >
        {project.type === 'MODEL' && (
          <Flex
            align="center"
            justify="center"
            className={modelChipStyle}
            title={i18n.modules.project.info.isAModel}
          >
            {project.globalProject ? (
              <Icon icon={'language'} color="white" />
            ) : (
              <Icon icon={'star'} color="white" />
            )}
          </Flex>
        )}
        <IllustrationDisplay illustration={project.illustration || defaultProjectIllustration} />
      </Flex>
      <Flex direction='column' align='stretch' gap={space_sm} className={cx(p_md, css({ height: '80px', textAlign: 'left' }))}>
        <Flex justify="space-between" align="center" className={cx()}>
          <h3 className={ellipsisStyle} title={project.name ? project.name : 'Project name'}>
            {project.name}
          </h3>
          <DropDownMenu
            icon={'more_vert'}
            valueComp={{ value: '', label: '' }}
            buttonClassName={cx(css({ marginLeft: '40px' }), lightIconButtonStyle)}
            entries={[
              {
                value: 'open',
                label: (
                  <>
                    <Icon icon={'edit'} /> {i18n.common.open}
                  </>
                ),
                action: () => window.open(`#/editor/${project.id}`, '_blank'),
              },
              {
                value: 'settings',
                label: (
                  <>
                    <Icon icon={'settings'} /> {i18n.common.settings}
                  </>
                ),
                action: () => navigate(`projectsettings/${project.id}`),
              },
              {
                value: 'duplicate',
                label: (
                  <>
                    <Icon icon={'content_copy'} /> {i18n.common.duplicate}
                  </>
                ),
                action: () => {
                  const newName = i18n.modules.project.projectCopy(project.name || '');
                  dispatch(API.duplicateProject({ project, newName }));
                },
              },
              ...(project.type !== 'MODEL'
                ? [
                    {
                      value: 'extractModel',
                      label: (
                        <>
                          <Icon icon={'star'} /> {i18n.modules.project.actions.saveAsModel}
                        </>
                      ),
                      action: () => navigate(`extractModel/${project.id}`),
                    },
                  ]
                : []),
              ...(currentUser?.admin && project.type !== 'MODEL'
                ? [
                    {
                      value: 'convertToModel',
                      label: (
                        <>
                          <Icon icon={'star'} /> {i18n.modules.project.actions.convertToModel}
                        </>
                      ),
                      action: () => {
                        dispatch(API.updateProject({ ...project, type: 'MODEL' })).then(() => {
                          navigate('/models');
                        });
                      },
                    },
                  ]
                : []),
              ...(currentUser?.admin && project.type === 'MODEL'
                ? [
                    {
                      value: 'convertToProject',
                      label: (
                        <>
                          <Icon icon={'flip_camera_android'} />
                          {i18n.modules.project.actions.convertToProject}
                        </>
                      ),
                      action: () => {
                        dispatch(API.updateProject({ ...project, type: 'PROJECT' })).then(() => {
                          navigate('/');
                        });
                      },
                    },
                  ]
                : []),
              {
                value: 'delete',
                label: (
                  <>
                    <Icon icon={'delete'} color={'var(--error-main)'} /> {i18n.common.delete}
                  </>
                ),
                action: () => navigate(`deleteproject/${project.id}`),
              },
            ]}
          />
        </Flex>
        <p
          title={project.description || ''}
          className={cx(multiLineEllipsisStyle, text_sm, lightTextStyle)}
        >
          {project.description}
        </p>
      </Flex>
    </Flex>
  );
};

interface ProjectListProps {
  projects: Project[];
  hideCreationButton?: boolean;
}

function ProjectList({ projects, hideCreationButton }: ProjectListProps) {
  const i18n = useTranslations();

  return (
    <Flex
      className={p_lg}
      direction={'column'}
      align='stretch'
    >
      {/* Note : any authenticated user can create a project */}
      {!projects || projects.length === 0 ? (
        <Flex justify="center" align="center" direction="column">
          <h2>{i18n.common.welcome}</h2>
          <h3>{i18n.modules.project.info.noProjectYet}</h3>
          {!hideCreationButton && <ProjectCreator />}
        </Flex>
      ) : !hideCreationButton ? (
        <Flex className={css({ alignSelf: 'flex-end', padding: space_sm })}>
          <ProjectCreator />
        </Flex>
      ) : (
        <></>
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
        thumbnailClassName={projectCardStyle}
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

      <Routes>
        <Route path="projectsettings/:projectId" element={<ProjectSettingsWrapper />} />
        <Route path="deleteproject/:projectId" element={<DeleteProjectWrapper />} />
        <Route path="extractModel/:projectId" element={<ExtractModelWrapper />} />
      </Routes>
    </Flex>
  );
}

export const MyProjects = (): JSX.Element => {
  const { status, projects } = useMyProjects();

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  if (status != 'READY' || projects == null) {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return <ProjectList projects={projects} />;
  }
};

export const AllProjectsAndModels = (): JSX.Element => {
  const { status, projects } = useAllProjectsAndModels();

  if (status != 'READY' || projects == null) {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return <ProjectList projects={projects} />;
  }
};

export const MyModels = (): JSX.Element => {
  const { status, projects } = useMyModels();

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      window.top.document.title = 'co.LAB';
    }
  }, []);

  if (status != 'READY' || projects == null) {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return <ProjectList projects={projects} hideCreationButton />;
  }
};
