/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useProjectRootCard } from '../../../selectors/cardSelector';
import { useAndLoadProjectTeam } from '../../../selectors/projectSelector';
import CardInvolvement from '../../cards/CardInvolvement';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import Tabs, { Tab } from '../../common/layout/Tabs';
import { space_L, space_S } from '../../styling/style';
import ProjectModelSharing from '../ProjectModelSharing';
import MemberCreator from './MemberCreator';
import TeamRACI from './Raci';
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
  const root = useProjectRootCard(project);
  const { members, status } = useAndLoadProjectTeam(projectId);

  if (status === 'INITIALIZED' && project.id != null) {
    return (
      <>
        <Flex justify="space-between" className={css({padding: space_L})}>
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
          <Tab name="projectACL" label={i18n.team.raci} invisible>
            <TeamRACI project={project} />
          </Tab>
          <Tab name="projectACL" label={i18n.modules.project.settings.involvements.label}>
            {entityIs(root, 'Card') ? <CardInvolvement card={root} /> : <InlineLoading />}
          </Tab>
          <Tab name="modelSharing" label="Share the model" invisible={project.type !== 'MODEL'}>
            <ProjectModelSharing projectId={project.id} />
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
