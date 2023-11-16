/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useCurrentProjectId } from '../../store/selectors/projectSelector';
import { space_md } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import TeamMembersPanel from './MembersList';
import ProjectTeamAssignmentsPanel from './ProjectAssignments';
import TeamRightsPanel from './Rights';
import TeamRolesPanel from './Roles';
import MassMemberCreator from './MassMemberCreator';

export default function TeamTabs(): JSX.Element {
  const i18n = useTranslations();

  const projectId = useCurrentProjectId();

  // just to assert that there is a current project
  if (projectId == null) {
    return <AvailabilityStatusIndicator status="ERROR" />;
  }

  return (
    <>
      <Flex justify="flex-end" className={css({ paddingRight: space_md })}>
        <MassMemberCreator mode="INVITE" />
      </Flex>
      <Tabs routed>
        <Tab name="members" label={i18n.team.members}>
          <TeamMembersPanel />
        </Tab>
        <Tab name="roles" label={i18n.team.roles}>
          <TeamRolesPanel />
        </Tab>
        <Tab name="rights" label={i18n.team.rights}>
          <TeamRightsPanel />
        </Tab>
        <Tab name="assignments" label={i18n.team.assignment.labels.assignments}>
          <ProjectTeamAssignmentsPanel />
        </Tab>
      </Tabs>
    </>
  );
}
