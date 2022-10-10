/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useProjectRootCard } from '../../selectors/cardSelector';
import { dispatch } from '../../store/store';
import CardInvolvement from '../cards/CardInvolvement';
import IconButton from '../common/element/IconButton';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import InlineLoading from '../common/element/InlineLoading';
import { LabeledInput, LabeledTextArea } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import { lightIconButtonStyle, space_L } from '../styling/style';
import { ProjectIllustrationMaker } from './ProjectIllustrationMaker';
import Team from './Team';

interface ProjectSettingsProps {
  project: Project;
}

// Display one project and allow to edit it
export function ProjectSettings({ project }: ProjectSettingsProps): JSX.Element {
  const navigate = useNavigate();
  const i18n = useTranslations();

  const root = useProjectRootCard(project);

  return (
    <Flex align="stretch" direction="column" grow={1} className={css({ alignSelf: 'stretch' })}>
      <Flex align="center">
        <IconButton
          icon={faArrowLeft}
          title={i18n.common.back}
          onClick={() => navigate(-1)}
          className={cx(css({ display: 'block' }), lightIconButtonStyle)}
        />
        <h2>{i18n.modules.project.labels.projectSettings}</h2>
      </Flex>
      <Tabs defaultTab="general">
        <Tab name="general" label={i18n.common.general}>
          <Flex className={css({ alignSelf: 'stretch' })}>
            <Flex
              direction="column"
              align="stretch"
              className={css({ width: '45%', minWidth: '45%', marginRight: space_L })}
            >
              <LabeledInput
                label={i18n.common.name}
                placeholder={i18n.modules.project.actions.newProject}
                value={project.name || ''}
                onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
              />
              <LabeledTextArea
                label={i18n.common.description}
                placeholder={i18n.common.info.writeDescription}
                value={project.description || ''}
                onChange={newValue =>
                  dispatch(API.updateProject({ ...project, description: newValue }))
                }
              />
            </Flex>
            <Flex
              direction="column"
              align="stretch"
              justify="flex-end"
              className={css({ width: '55%' })}
            >
              <IllustrationDisplay illustration={project.illustration} />
              <ProjectIllustrationMaker
                illustration={project.illustration}
                setIllustration={i =>
                  dispatch(
                    API.updateProject({
                      ...project,
                      illustration: i,
                    }),
                  )
                }
              />
            </Flex>
          </Flex>
        </Tab>
        <Tab name="team" label={i18n.team.team}>
          <Team project={project} />
        </Tab>
        <Tab name="projectACL" label={i18n.modules.project.settings.involvements.label}>
          {entityIs(root, 'Card') ? <CardInvolvement card={root} /> : <InlineLoading />}
        </Tab>
      </Tabs>
    </Flex>
  );
}
