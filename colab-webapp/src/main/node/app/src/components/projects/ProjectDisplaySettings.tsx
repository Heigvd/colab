/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Illustration, Project } from 'colab-rest-client/dist/ColabClient';
import * as React from 'react';
import * as API from '../../API/api';
import { dispatch } from '../../store/store';
import Button from '../common/element/Button';
import ButtonWithLoader from '../common/element/ButtonWithLoader';
import { BlockInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import { ProjectIllustrationMaker } from './ProjectIllustrationMaker';

interface ProjectDisplaySettingsProps {
  project: Project;
  onClose: () => void;
}
// Display one project and allow to edit it
export function ProjectDisplaySettings({
  project,
  onClose,
}: ProjectDisplaySettingsProps): JSX.Element {
  const [illustration, setIllustration] = React.useState<Illustration | undefined | null>(
    project.illustration,
  );
  const onConfirm = React.useCallback(() => {
    if (illustration) {
      dispatch(
        API.updateProject({
          ...project,
          illustration: illustration,
        }),
      ).then(() => onClose());
    }
  }, [illustration, onClose, project]);
  return (
    <Flex align="stretch" direction="column" className={css({ alignSelf: 'stretch' })}>
      <BlockInput
        label="Name"
        placeholder="New project"
        value={project.name || ''}
        saveMode="ON_CONFIRM"
        onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
      />
      <BlockInput
        label="Description"
        inputType="textarea"
        placeholder="Write a description here"
        value={project.description || ''}
        saveMode="ON_CONFIRM"
        onChange={newValue => dispatch(API.updateProject({ ...project, description: newValue }))}
      />
      <ProjectIllustrationMaker illustration={illustration} setIllustration={setIllustration} />
      <Flex align='center'>
        <Button onClick={onClose} invertedButton>Cancel</Button>
        <ButtonWithLoader
          onClick={onConfirm}
        >
          Save illustration
        </ButtonWithLoader>
      </Flex>
    </Flex>
  );
}
