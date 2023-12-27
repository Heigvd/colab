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
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import InlineLoading from '../../common/element/InlineLoading';
import { LabeledInput, LabeledTextArea } from '../../common/element/Input';
import IllustrationPicker from '../../common/element/illustration/IllustrationPicker';
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
    <Flex direction="column" align="stretch" className={css({ alignSelf: 'stretch' })}>
      <LabeledInput
        label={i18n.common.name}
        placeholder={i18n.modules.project.actions.newProject}
        value={project.name || ''}
        onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
        containerClassName={css({ padding: 0, flexGrow: 1 })}
      />
      <LabeledTextArea
        label={i18n.common.description}
        placeholder={i18n.common.info.writeDescription}
        value={project.description || ''}
        onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
        containerClassName={css({ padding: 0, flexGrow: 2 })}
      />
      <IllustrationPicker
        selectedIllustration={project.illustration}
        onSelectIllustration={i =>
          dispatch(
            API.updateProject({
              ...project,
              illustration: i,
            }),
          )
        }
        iconList={projectIcons}
        iconContainerClassName={css({ maxHeight: '260px' })}
      />
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
      size="lg"
      className={css({
        '&:hover': { textDecoration: 'none' },
        display: 'flex',
      })}
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
