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
import { labelStyle, space_2xs, space_md } from '../../../styling/style';
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
    <Flex
      direction="column"
      align="stretch"
      grow={1}
      gap={space_md}
      className={css({ alignSelf: 'stretch', overflow: 'hidden' })}
    >
      <Flex direction="column" align="stretch" gap={space_2xs}>
        <label className={labelStyle}>{i18n.common.name}</label>
        <LabeledInput
          placeholder={i18n.modules.project.actions.newProject}
          value={project.name || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
          containerClassName={css({ padding: 0 })}
        />
      </Flex>
      <Flex direction="column" align="stretch" gap={space_2xs}>
        <label className={labelStyle}>{i18n.common.description}</label>
        <LabeledTextArea
          placeholder={i18n.common.info.writeDescription}
          value={project.description || ''}
          onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
          containerClassName={css({ padding: 0 })}
        />
      </Flex>
      <IllustrationPicker
        selectedIllustration={project.illustration}
        onChangeIllustration={i =>
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
