/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAppSelector } from '../../store/hooks';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { useProjectRootCard } from '../../store/selectors/cardSelector';
import { space_sm } from '../../styling/style';
import ProjectCardTypeList from '../cardtypes/ProjectCardTypeList';
import InlineLoading from '../common/element/InlineLoading';
import { TipsCtx, WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import { AccessLevel, ResourceAndRef, ResourceOwnership } from '../resources/resourcesCommonType';
import {
  DisplayMode,
  ResourcesCtx,
  ResourcesMainViewHeader,
  ResourcesMainViewPanel,
} from '../resources/ResourcesMainView';

interface DocumentationTabProps {
  project: Project;
}

export default function DocumentationTab({ project }: DocumentationTabProps): JSX.Element {
  const i18n = useTranslations();

  const tipsConfig = React.useContext(TipsCtx);

  const root = useProjectRootCard(project.id);

  const [resourcesDisplayMode, setResourcesDisplayMode] = React.useState<DisplayMode | null>(null);
  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);
  const [lastCreatedResourceId, setLastCreatedResourceId] = React.useState<number | null>(null);

  const rootState = useAppSelector(state => {
    if (entityIs(root, 'Card')) {
      const rootState = state.cards.cards[root.id!];
      if (rootState?.card != null && rootState.contents != null) {
        return {
          card: rootState.card!,
          contentId: rootState.contents[0]!,
        };
      }
    }
    return undefined;
  });

  const resourceOwnership: ResourceOwnership | undefined = React.useMemo(() => {
    if (rootState != null) {
      return {
        kind: 'CardOrCardContent',
        hasSeveralVariants: false,
        cardId: rootState.card.id!,
        cardContentId: rootState.contentId,
      };
    } else {
      return undefined;
    }
  }, [rootState]);

  const { canRead, canWrite } = useCardACLForCurrentUser(
    entityIs(root, 'Card') ? root.id : undefined,
  );

  const accessLevel: AccessLevel = canWrite
    ? 'WRITE'
    : canRead
    ? 'READ'
    : canRead != null
    ? 'DENIED'
    : 'UNKNOWN';

  return (
    <Flex
      align="stretch"
      direction="column"
      grow={1}
      className={css({ alignSelf: 'stretch', padding: space_sm })}
    >
      <Tabs routed>
        <Tab name="documentation" label={i18n.modules.project.settings.resources.label} invisible>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'stretch',
              flexGrow: 1,
            })}
          >
            {resourceOwnership != null ? (
              <>
                <ResourcesCtx.Provider
                  value={{
                    resourceOwnership,
                    displayMode: resourcesDisplayMode,
                    setDisplayMode: setResourcesDisplayMode,
                    selectedResource,
                    selectResource,
                    lastCreatedId: lastCreatedResourceId,
                    setLastCreatedId: setLastCreatedResourceId,
                    publishNewResource: true,
                  }}
                >
                  <Flex align="baseline">
                    <ResourcesMainViewHeader />
                  </Flex>
                  <ResourcesMainViewPanel accessLevel={accessLevel} />
                </ResourcesCtx.Provider>
              </>
            ) : (
              <InlineLoading />
            )}
          </div>
        </Tab>

        <Tab
          name="cardTypes"
          label={i18n.modules.cardType.cardTypesLongWay}
          invisible={!tipsConfig.WIP.value}
        >
          <WIPContainer>
            <ProjectCardTypeList />
          </WIPContainer>
        </Tab>
      </Tabs>
    </Flex>
  );
}
