/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { labelStyle, space_2xs, space_lg } from '../../styling/style';
import { LabeledInput, LabeledTextArea } from '../common/element/Input';
import IllustrationPicker from '../common/element/illustration/IllustrationPicker';
import Flex from '../common/layout/Flex';
import { defaultProjectIllustration, projectIcons } from '../projects/ProjectCommon';
import ProjectSettingsGeneral from '../projects/settings/ProjectSettingsGeneral';

const width = '500px';
const height = '450px';

export default function DebugPanel(): JSX.Element {
  return (
    <Flex className={css({ gap: '20px' })}>
      <Flex
        className={css({
          width,
          height,
          border: '1px dotted orange',
        })}
      >
        <DebugPanel1 />
      </Flex>
      <Flex
        className={css({
          width,
          height,
          border: '1px dotted blue',
        })}
      >
        <DebugPanelGoal />
      </Flex>
    </Flex>
  );
}

function DebugPanelGoal(): JSX.Element {
  return <ProjectSettingsGeneral projectId={8} />;
}

function DebugPanel1(): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex
      direction="column"
      align="stretch"
      gap={space_lg}
      // className={css({ maxHeight: '100%' })}
      //className={css({ overflow: 'hidden' })}
      className={css({ alignSelf: 'stretch' })}
    >
      <Flex direction="column" align="stretch" gap={space_2xs}>
        <label className={labelStyle}>{i18n.common.name}</label>
        <LabeledInput
          placeholder={i18n.modules.project.actions.newProject}
          value={'un potager du tonnerre'}
          onChange={() => {}}
          containerClassName={css({ padding: 0 })}
        />
      </Flex>
      <Flex direction="column" align="stretch" gap={space_2xs}>
        <label className={labelStyle}>{i18n.common.description}</label>
        <LabeledTextArea
          placeholder={i18n.common.info.writeDescription}
          value={'envie de faire un potager'}
          onChange={() => {}}
          containerClassName={css({ padding: 0, flexGrow: 1 })}
          rows={2}
        />
      </Flex>
      <IllustrationPicker
        selectedIllustration={defaultProjectIllustration}
        onChangeIllustration={() => {}}
        iconList={projectIcons}
      />
    </Flex>
  );
}
