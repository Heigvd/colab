/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useCurrentProjectRootCard } from '../../../selectors/cardSelector';
import { useCurrentProjectId } from '../../../selectors/projectSelector';
import CardInvolvement from '../../cards/CardInvolvement';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import Tabs, { Tab } from '../../common/layout/Tabs';
import { space_md } from '../../styling/style';
import TeamMemberCreator from './MemberCreator';
import TeamMembersList from './MembersList';
import TeamRACI from './Raci';
import TeamRights from './Rights';
import TeamRolesPanel from './Roles';

export const gridNewLine = css({
  gridColumnStart: 1,
  justifySelf: 'start',
});

export default function Team(): JSX.Element {
  const i18n = useTranslations();

  const projectId = useCurrentProjectId();

  const rootCard = useCurrentProjectRootCard();

  if (projectId == null) {
    return <AvailabilityStatusIndicator status="ERROR" />;
  }

  return (
    <>
      <Flex justify="flex-end" className={css({ paddingRight: space_md})}>
        <TeamMemberCreator />
      </Flex>
      <Tabs routed>
        <Tab name="members" label={i18n.team.members}>
          <TeamMembersList/>
        </Tab>
        <Tab name="rights" label={i18n.team.rights}>
          <TeamRights />
        </Tab>
        <Tab name="roles" label={i18n.team.roles}>
          <TeamRolesPanel />
        </Tab>
        <Tab name="assignations" label={i18n.team.raci.raci}>
          <TeamRACI />
        </Tab>
        <Tab name="projectACL" label={i18n.modules.project.settings.involvements.label} invisible>
          {entityIs(rootCard, 'Card') ? <CardInvolvement card={rootCard} /> : <InlineLoading />}
        </Tab>
      </Tabs>
    </>
  );
}
