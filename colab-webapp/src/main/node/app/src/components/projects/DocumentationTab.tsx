/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs, Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useCardACLForCurrentUser, useProjectRootCard } from '../../selectors/cardSelector';
import { useAppSelector } from '../../store/hooks';
import ProjectCardTypeList from '../cards/cardtypes/ProjectCardTypeList';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import Tabs, { Tab } from '../common/layout/Tabs';
import { AccessLevel, ResourceCallContext } from '../resources/resourcesCommonType';
import ResourcesMainView from '../resources/ResourcesMainView';

interface DocumentationTabProps {
  project: Project;
}

export default function DocumentationTab({ project }: DocumentationTabProps): JSX.Element {
  const i18n = useTranslations();

  const root = useProjectRootCard(project);

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

  const resourceContext: ResourceCallContext | undefined = React.useMemo(() => {
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
    <Flex align="stretch" direction="column" grow={1} className={css({ alignSelf: 'stretch' })}>
      <Tabs routed defaultTab="project">
        <Tab name="project" label={i18n.modules.project.settings.resources.label}>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'stretch',
              flexGrow: 1,
            })}
          >
            {resourceContext != null ? (
              <>
                <Flex>
                  <h2>{i18n.modules.project.settings.resources.label}</h2>
                  {/* <TocDisplayToggler /> */}
                </Flex>
                <ResourcesMainView
                  accessLevel={accessLevel}
                  contextData={resourceContext}
                  showVoidIndicator
                />
              </>
            ) : (
              <InlineLoading />
            )}
          </div>
        </Tab>
        <Tab name="cardTypes" label={i18n.modules.cardType.cardTypesLongWay}>
          <ProjectCardTypeList />
        </Tab>
      </Tabs>
    </Flex>
  );
}
