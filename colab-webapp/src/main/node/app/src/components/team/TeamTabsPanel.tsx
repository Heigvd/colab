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
import { space_md, teamTabBodyStyle } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import ProjectInvitationAction from './MemberCreator';
import TeamMembersPanel from './MembersList';
import TeamAssignmentsPanel from './ProjectAssignmentsTable';
import TeamRightsPanel from './RightsTable';
import TeamRolesPanel from './RolesTable';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Style

const invitationActionStyle = css({
  paddingRight: space_md,
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Panel

export default function TeamTabsPanel(): JSX.Element {
  const i18n = useTranslations();

  // just to assert that there is a current project
  const projectId = useCurrentProjectId();
  if (projectId == null) {
    return <AvailabilityStatusIndicator status="ERROR" />;
  }

  return (
    <>
      <Flex justify="flex-end" className={invitationActionStyle}>
        <ProjectInvitationAction mode="INVITE" />
      </Flex>
      <Tabs routed bodyClassName={teamTabBodyStyle}>
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
          <TeamAssignmentsPanel />
        </Tab>
      </Tabs>
    </>
  );
}
