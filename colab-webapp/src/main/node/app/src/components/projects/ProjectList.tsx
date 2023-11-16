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
import useTranslations from '../../i18n/I18nContext';
import {
  useAllProjectsAndModels,
  useMyModels,
  useMyProjects,
} from '../../store/selectors/projectSelector';
import { compareById } from '../../store/selectors/selectorHelper';
import { br_xl, p_0, space_lg, space_sm, space_xl, space_xs } from '../../styling/style';
import ItemThumbnailsSelection from '../common/collection/ItemThumbnailsSelection';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Flex from '../common/layout/Flex';
import ProjectThumb from './ProjectThumb';
import ProjectCreator from './creation/NewProjectCreator';
import { ProjectModelExtractor } from './models/ProjectModelExtractor';
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

interface ProjectListProps {
  projects: Project[];
  hideCreationButton?: boolean;
}

function ProjectList({ projects, hideCreationButton }: ProjectListProps) {
  const i18n = useTranslations();

  return (
    <>
      {!projects || projects.length === 0 ? (
        <Flex justify="flex-start" align="center" direction="column">
          <h2>{i18n.common.welcome}</h2>
          <h3 className={css({ marginBottom: '20px' })}>
            {i18n.modules.project.info.noProjectYet}
          </h3>
          {!hideCreationButton && <ProjectCreator />}
        </Flex>
      ) : (
        <Flex align="stretch" className={css({ maxHeight: '100%' })}>
          <Flex>
            {/* Note : any authenticated user can create a project */}
            {!hideCreationButton ? (
              <Flex
                className={css({
                  marginLeft: space_sm,
                })}
              >
                <ProjectCreator />
              </Flex>
            ) : (
              <></>
            )}
          </Flex>

          <Flex
            grow="1"
            className={css({
              paddingTop: space_xs,
              paddingRight: space_lg,
              paddingBottom: space_lg,
              paddingLeft: space_sm,
              overflow: 'auto',
            })}
            direction={'column'}
            align="stretch"
          >
            {/* {projects
            .sort((a, b) => compareById(a, b))
            .map(project => {
              if (project != null) {
                return <ProjectDisplay key={project.id} project={project} />;
              } else {
                return <InlineLoading />;
              }
            })} */}
            <ItemThumbnailsSelection<Project>
              items={projects.sort((a, b) => compareById(a, b))}
              className={projectListStyle}
              thumbnailClassName={projectCardStyle}
              onItemClick={item => {
                if (item) {
                  window.open(`#/editor/${item.id}`, '_blank');
                }
              }}
              fillThumbnail={item => {
                if (item === null) return <></>;
                else return <ProjectThumb project={item} />;
              }}
              disableOnEnter
            />
          </Flex>

          <Routes>
            <Route path="projectsettings/:projectId" element={<ProjectSettingsWrapper />} />
            <Route path="extractModel/:projectId" element={<ExtractModelWrapper />} />
          </Routes>
        </Flex>
      )}
    </>
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
