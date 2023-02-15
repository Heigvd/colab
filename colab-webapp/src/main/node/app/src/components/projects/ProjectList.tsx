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
  ellipsisStyle,
  invertedButtonStyle,
  lightIconButtonStyle,
  multiLineEllipsisStyle,
  space_lg,
  space_sm,
  text_sm,
} from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';
import ProjectCreator from './ProjectCreator';
import { ProjectModelExtractor } from './ProjectModelExtractor';
import { ProjectSettingsGeneralInModal } from './settings/ProjectSettingsGeneral';

const modelChipStyle = css({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: '10px 10px 12px 12px',
  borderRadius: '0 0 0 50%',
  backgroundColor: 'var(--primary-main)',
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

const projectListStyle = css({
  width: '100%',
  display: 'inline-grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gridColumnGap: '30px',
  gridRowGap: '30px',
});

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
      className={cx(
        {
          [css({
            boxShadow: ` 0px -5px 0px 0px ${project.illustration?.iconBkgdColor} inset`,
          })]: project.type === 'MODEL',
        },
        className,
      )}
    >
      <Flex
        className={css({
          height: '80px',
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
               <Icon icon={'globe'} color="white" opsz="sm" />
            ) : (
               <Icon icon={'star'} color="white" opsz="sm" />
            )}
          </Flex>
        )}
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
            paddingLeft: space_lg,
            paddingRight: space_lg,
            paddingTop: space_lg,
            paddingBottom: space_sm,
          })}
        >
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
                     <Icon icon={'content-copy'} /> {i18n.common.duplicate}
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
                           <Icon icon={'star'} />{' '}
                          {i18n.modules.project.actions.saveAsModel}
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
                           <Icon icon={'star'} />{' '}
                          {i18n.modules.project.actions.convertToModel}
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
                           <Icon icon={'magic_exchange'} />
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
        </div>
        <div
          className={css({
            padding: space_lg,
            paddingTop: 0,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          })}
        >
          <div title={project.description || ''} className={cx(multiLineEllipsisStyle, text_sm)}>
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
  hideCreationButton?: boolean;
}

function ProjectList({ projects, hideCreationButton }: ProjectListProps) {
  const i18n = useTranslations();

  return (
    <Flex
      className={css(
        hideCreationButton ? { padding: '2rem' } : { padding: '.5rem 2rem 2rem 2rem' },
      )}
      direction={'column'}
    >
      {/* Note : any authenticated user can create a project */}
      {!projects || projects.length === 0 ? (
        <Flex justify="center" align="center" direction="column">
          <h2>{i18n.common.welcome}</h2>
          <h3>{i18n.modules.project.info.noProjectYet}</h3>
          {!hideCreationButton && (
            <ProjectCreator
              collapsedButtonClassName={cx(invertedButtonStyle, css({ marginTop: space_sm }))}
            />
          )}
        </Flex>
      ) : !hideCreationButton ? (
        <Flex className={css({ alignSelf: 'flex-end', padding: space_sm })}>
          <ProjectCreator
            collapsedButtonClassName={cx(invertedButtonStyle, css({ fontSize: '0.8em' }))}
          />
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
        thumbnailClassName={css({
          padding: 0,
          margin: '4px',
          display: 'block',
          backgroundColor: 'var(--bg-primary)',
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
