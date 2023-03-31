/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch } from '../../../store/hooks';
import { useProject } from '../../../store/selectors/projectSelector';
import { space_xl } from '../../../styling/style';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import InlineLoading from '../../common/element/InlineLoading';
import { LabeledInput, LabeledTextArea } from '../../common/element/Input';
import ProjectIllustrationPicker from '../../common/illustration/IllustrationPicker';
import Flex from '../../common/layout/Flex';
import Modal from '../../common/layout/Modal';
import { projectIcons } from '../ProjectCommon';

export interface ProjectSettingsGeneralProps {
  projectId: number;
}

export default function ProjectSettingsGeneral({
  projectId,
}: ProjectSettingsGeneralProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project, status } = useProject(projectId);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex direction="column" className={css({ alignSelf: 'stretch' })}>
      <Flex className={css({ alignSelf: 'stretch', margin: '10px' })}>
        <Flex
          direction="column"
          align="stretch"
          className={css({
            width: '45%',
            minWidth: '45%',
            marginRight: space_xl,
            //marginLeft: '-18px', sounds good, doesn't work T.T (actually works too well)
          })}
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
          <ProjectIllustrationPicker
            illustration={project.illustration}
            setIllustration={i =>
              dispatch(
                API.updateProject({
                  ...project,
                  illustration: i,
                }),
              )
            }
            iconList={projectIcons}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}

export interface ProjectSettingsGeneralInModalProps {
  projectId: number;
  onClose: () => void;
}

export function ProjectSettingsGeneralInModal({
  projectId,
  onClose,
}: ProjectSettingsGeneralInModalProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Modal
      title={i18n.modules.project.labels.projectSettings}
      showCloseButton
      onClose={onClose}
      className={css({
        '&:hover': { textDecoration: 'none' },
        display: 'flex',
      })}
      size="full"
    >
      {() => {
        if (projectId != null) {
          return <ProjectSettingsGeneral projectId={projectId} />;
        } else {
          return <InlineLoading />;
        }
      }}
    </Modal>
  );
}
