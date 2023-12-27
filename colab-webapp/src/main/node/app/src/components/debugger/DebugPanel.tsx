/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { labelStyle, space_md, space_sm } from '../../styling/style';
import { projectColors } from '../../styling/theme';
import IconPicker from '../common/element/IconPicker';
import { ColorPicker } from '../common/element/color/ColorPicker';
import IllustrationPicker from '../common/element/illustration/IllustrationPicker';
import Flex from '../common/layout/Flex';
import { defaultProjectIllustration, projectIcons } from '../projects/ProjectCommon';

const width = '320px';
const height = '300px';

export default function DebugPanel(): JSX.Element {
  return (
    <Flex className={css({ justifySelf: 'center', gap: '20px' })}>
      <Flex
        justify="stretch"
        align="stretch"
        className={css({
          alignSelf: 'center',
          width,
          height,
          border: '1px dotted orange',
        })}
      >
        <DebugPanel2 />
      </Flex>
      <Flex
        justify="stretch"
        align="stretch"
        className={css({
          alignSelf: 'center',
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
  return (
    <IllustrationPicker
      iconList={projectIcons}
      onSelectIllustration={() => {}}
      selectedIllustration={defaultProjectIllustration}
    />
  );
}

function DebugPanel2(): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex direction="column" align="stretch" gap={space_md}>
      <Flex direction="column" gap={space_sm}>
        <label className={labelStyle}>{i18n.modules.card.settings.color}</label>
        <ColorPicker
          colors={Object.values(projectColors)}
          onChange={() => {}}
          color={'blue'}
          width="auto"
          className={css({ padding: space_sm })}
        />
      </Flex>
      <Flex
        direction="column"
        align="stretch"
        gap={space_sm}
        className={css({ overflow: 'hidden' })}
      >
        <label className={labelStyle}>{i18n.common.icon}</label>
        <IconPicker
          iconList={projectIcons}
          selectedIcon={'stadia_controller'}
          onSelect={() => {}}
          selectionColor="fuchsia"
        />
      </Flex>
    </Flex>
  );
}
