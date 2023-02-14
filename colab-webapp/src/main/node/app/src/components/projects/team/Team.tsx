/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useProjectRootCard } from '../../../selectors/cardSelector';
import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import CardInvolvement from '../../cards/CardInvolvement';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import Tabs, { Tab } from '../../common/layout/Tabs';
import { space_xl, space_sm } from '../../styling/style';
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
  padding: space_sm + ' 0',
  fontWeight: 800,
  borderBottom: '1px solid var(--divider-main)',
});

export interface TeamProps {
  project: Project;
}

export default function Team({ project }: TeamProps): JSX.Element {
  const i18n = useTranslations();
  const projectId = project.id;
  const root = useProjectRootCard(projectId);
  const { members, status } = useAndLoadProjectTeam(projectId);

  if (status === 'READY' && project.id != null) {
    return (
      <>
        <Flex justify="space-between" className={css({ padding: space_xl })}>
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
