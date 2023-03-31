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
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import ItemThumbnailsSelection from '../common/collection/ItemThumbnailsSelection';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import { ConfirmDeleteModal } from '../common/layout/ConfirmDeleteModal';
import Flex from '../common/layout/Flex';
import { br_xl, p_0, p_lg, space_sm, space_xl } from '../styling/style';
import { ProjectModelExtractor } from './models/ProjectModelExtractor';
import ProjectDisplay from './ProjectCard';
import ProjectCreator from './ProjectCreator';
import { ProjectSettingsGeneralInModal } from './settings/ProjectSettingsGeneral';

const projectCardStyle = cx(
  br_xl,
  p_0,
  css({
    flexDirection: 'column',
    backgroundColor: 'var(--bg-primary)',
    alignItems: 'stretch',
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

interface ProjectListProps {
  projects: Project[];
  hideCreationButton?: boolean;
}

function ProjectList({ projects, hideCreationButton }: ProjectListProps) {
  const i18n = useTranslations();

  return (
    <Flex className={cx(p_lg, css({ paddingTop: 0 }))} direction={'column'} align="stretch">
      {/* Note : any authenticated user can create a project */}
      {!projects || projects.length === 0 ? (
        <Flex justify="space-between" align="center" direction="column">
          <h2>{i18n.common.welcome}</h2>
          <h3 className={css({ marginBottom: '20px' })}>
            {i18n.modules.project.info.noProjectYet}
          </h3>
          {!hideCreationButton && <ProjectCreator />}
        </Flex>
      ) : !hideCreationButton ? (
        <Flex className={css({ alignSelf: 'flex-start', padding: space_sm, paddingLeft: '0px' })}>
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
