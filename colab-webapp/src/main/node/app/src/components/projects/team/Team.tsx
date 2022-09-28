/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadProjectTeam } from '../../../selectors/projectSelector';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import Tabs, { Tab } from '../../common/layout/Tabs';
import {
  space_S,
} from '../../styling/style';
import MemberCreator from './MemberCreator';
import TeamRights from './Rights';
import TeamRoles from './Roles';

export const gridNewLine = css({
  gridColumnStart: 1,
  justifySelf: 'start',
});
export const titleCellStyle = css({
  justifySelf: 'stretch',
  padding: space_S + ' 0',
  fontWeight: 800,
  borderBottom: '1px solid var(--lightGray)',
});

export interface TeamProps {
  project: Project;
}

export default function Team({ project }: TeamProps): JSX.Element {
  const i18n = useTranslations();
  const projectId = project.id;

  const { members, status } = useAndLoadProjectTeam(projectId);

  if (status === 'INITIALIZED') {
    return (
      <>
        <Flex justify="space-between">
          <h2>{i18n.team.team}</h2>
          <MemberCreator members={members} project={project} />
        </Flex>
        <Tabs routed>
          <Tab name="roles" label={i18n.team.members}>
            <TeamRoles project={project} />
          </Tab>
          <Tab name="rights" label={i18n.team.rights}>
            <TeamRights project={project} />
          </Tab>
          <Tab name="projectACL" label={i18n.team.raci}>
            WIP RACI matrix
          </Tab>
        </Tabs>
      </>
    );
  } else {
    return (
      <div>
        <InlineLoading />
      </div>
    );
  }
}