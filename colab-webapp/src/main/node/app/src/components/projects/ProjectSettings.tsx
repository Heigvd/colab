/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faGlobe, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Project } from 'colab-rest-client';
import * as React from 'react';
//import { CSVLink } from 'react-csv';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import logger from '../../logger';
import { useAppSelector } from '../../store/hooks';
import { dispatch } from '../../store/store';
import Button from '../common/element/Button';
import Checkbox from '../common/element/Checkbox';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import { LabeledInput, LabeledTextArea } from '../common/element/Input';
import ConfirmDeleteOpenCloseModal from '../common/layout/ConfirmDeleteModal';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import {
  borderRadius,
  disabledStyle,
  errorColor,
  labelStyle,
  space_L,
  space_M,
  space_S,
  textSmall,
} from '../styling/style';
import { ProjectIllustrationMaker } from './ProjectIllustrationMaker';

interface ProjectSettingsProps {
  project: Project;
}

// Display one project and allow to edit it
export function ProjectSettings({ project }: ProjectSettingsProps): JSX.Element {
  const i18n = useTranslations();
  const state = useAppSelector(state => state);
  const [isProjectGlobal, setIsProjectGlobal] = React.useState<boolean>(false);

  return (
    <Flex align="stretch" direction="column" grow={1} className={css({ alignSelf: 'stretch', padding: space_L })}>
      <Tabs>
        {/* not routed because does not work well when opened from projects' list as a modal */}
        <Tab name="general" label={i18n.common.general}>
          <Flex direction="column" className={css({ alignSelf: 'stretch' })}>
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
          </Flex>
        </Tab>
        <Tab
          name="share"
          label={i18n.modules.project.settings.sharing.parameters}
          invisible={project.type === 'PROJECT'}
        >
          <Flex direction="column">
            <h2>{i18n.modules.project.settings.sharing.parameters}</h2>
            <Flex direction="column">
              <h3>{i18n.modules.project.labels.include}</h3>
              <Checkbox
                value={true} //{data.withRoles}
                label={i18n.modules.project.labels.roles}
                onChange={(_newValue: boolean) => {
                  //setData({ ...data, withRoles: newValue });
                }}
              />
              <Checkbox
                value={true} //{data.withDeliverables}
                label={i18n.modules.project.labels.cardContents}
                onChange={(_newValue: boolean) => {
                  // setData({ ...data, withDeliverables: newValue });
                }}
              />
              <Checkbox
                value={true} //{data.withResources}
                label={i18n.modules.project.labels.documentation}
                onChange={(_newValue: boolean) => {
                  //setData({ ...data, withResources: newValue });
                }}
              />
            </Flex>
            <Flex direction="column">
              <h3>{i18n.modules.project.labels.connect}</h3>
              <Checkbox
                value={true} //{data.withResources}
                label={i18n.modules.project.labels.keepConnectionBetweenModelAndProject}
                onChange={(_newValue: boolean) => {
                  //setData({ ...data, withResources: newValue });
                }}
              />
            </Flex>
          </Flex>
        </Tab>
        <Tab name="Advanced" label={i18n.common.advanced}>
          <Flex direction="column">
            <div className={labelStyle}>{i18n.common.action.exportProjectData}</div>
            <p className={textSmall}>{i18n.common.action.exportDataDescription}</p>
            <Flex gap={space_S}>
              {/* <Button className={invertedButtonStyle}>.json</Button> */}
              <Button
                className={disabledStyle}
                onClick={() => {
                  logger.info(state);
                }}
              >
                .csv
              </Button>
              {/* <CSVLink data={csvData}>Download me</CSVLink> */}
            </Flex>
          </Flex>
          {project.type === 'MODEL' && (
            <Flex
              align="stretch"
              className={css({ border: '1px solid var(--fgColor)', borderRadius: borderRadius })}
            >
              <Flex
                justify="center"
                align="center"
                className={css({ backgroundColor: 'var(--fgColor)', width: '80px' })}
              >
                <FontAwesomeIcon
                  icon={isProjectGlobal ? faGlobe : faStar}
                  className={css({ color: 'var(--bgColor)' })}
                  size="2x"
                />
              </Flex>
              <Flex direction="column" align="stretch" className={css({ padding: space_M })}>
                {isProjectGlobal ? (
                  <>
                    <h3>This model is global</h3>
                    <p>Everyone with a co.LAB account can create a project base on this model.</p>
                    <p>Want to make it private?</p>
                    <ConfirmDeleteOpenCloseModal
                      title="Make private"
                      buttonLabel={
                        <Button
                          invertedButton
                          className={cx(css({ color: errorColor, borderColor: errorColor }))}
                          clickable
                        >
                          <FontAwesomeIcon icon={faStar} /> Make private
                        </Button>
                      }
                      className={css({
                        '&:hover': { textDecoration: 'none' },
                        display: 'flex',
                        alignItems: 'center',
                        alignSelf: 'flex-end',
                      })}
                      message={
                        <p>
                          Are you sure you want to make this model private? Once private, no one
                          will be able to create a project from this model except the people you
                          share it with.
                        </p>
                      }
                      onConfirm={() => setIsProjectGlobal(e => !e)}
                      confirmButtonLabel="Make private"
                    />
                  </>
                ) : (
                  <>
                    <h3>This model is private</h3>
                    <p>You can share it for edition or usage to create prjects based on it.</p>
                    <p>Want to make it global?</p>
                    <ConfirmDeleteOpenCloseModal
                      title="Make global"
                      buttonLabel={
                        <Button
                          invertedButton
                          className={cx(css({ color: errorColor, borderColor: errorColor }))}
                          clickable
                        >
                          <FontAwesomeIcon icon={faGlobe} /> Make global
                        </Button>
                      }
                      className={css({
                        '&:hover': { textDecoration: 'none' },
                        display: 'flex',
                        alignItems: 'center',
                        alignSelf: 'flex-end',
                      })}
                      message={
                        <p>
                          Are you sure you want to make this model global? Once global, everyone
                          with a co.LAB account will be able to create a project base on this model.
                        </p>
                      }
                      onConfirm={() => setIsProjectGlobal(e => !e)}
                      confirmButtonLabel="Make global"
                    />
                  </>
                )}
              </Flex>
            </Flex>
          )}
        </Tab>
      </Tabs>
    </Flex>
  );
}
