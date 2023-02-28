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
import { space_md } from '../../styling/style';
import MemberCreator from './MemberCreator';
import MembersList from './MembersList';
import TeamRACI from './Raci';
import TeamRights from './Rights';
import TeamRoles from './Roles';

export const gridNewLine = css({
  gridColumnStart: 1,
  justifySelf: 'start',
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
        <Flex justify="flex-end" className={css({ paddingRight: space_md })}>
          <MemberCreator members={members} project={project} />
        </Flex>
        <Tabs routed>
          <Tab name="members" label={i18n.team.members}>
            <MembersList project={project} />
          </Tab>
          <Tab name="rights" label={i18n.team.rights}>
            <TeamRights project={project} />
          </Tab>
          <Tab name="roles" label={i18n.team.roles}>
            <TeamRoles project={project} />
          </Tab>
          <Tab name="projectACL" label={i18n.team.raci.raci} invisible>
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
