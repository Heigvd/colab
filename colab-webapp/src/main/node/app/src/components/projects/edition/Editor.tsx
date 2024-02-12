/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useDefaultVariant, useProjectRootCard } from '../../../store/selectors/cardSelector';
import { selectCurrentProject } from '../../../store/selectors/projectSelector';
import AdminTabs from '../../admin/AdminTabs';
import CardEditor from '../../cards/CardEditor';
import RootView from '../../cards/CardRootView';
import CardWrapper from '../../cards/CardWrapper';
import CardsBin from '../../cards/CardsBin';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import { PresenceContext, usePresenceContext } from '../../presence/PresenceContext';
import SettingsTabs from '../../settings/SettingsTabs';
import ProjectTasksPanel from '../../team/ProjectTasksList';
import TeamTabsPanel from '../../team/TeamTabsPanel';
import DocumentationTabs from '../DocumentationTabs';
import { ProjectNav } from '../ProjectNav';
import ProjectSidePanelWrapper from '../SidePanelWrapper';
import ActivityFlowChartPanel from '../activityFlow/ActivityFlowChartPanel';
import HierarchyPanel from '../hierarchy/HierarchyPanel';
import ListViewRoot from '../listView/ListViewRoot';
import { ProjectSettingsTabs } from '../settings/ProjectSettingsTabs';

export default function Editor(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project, status } = useAppSelector(selectCurrentProject);

  const root = useProjectRootCard(project?.id);

  const presenceContext = usePresenceContext();

  const rootContent = useAppSelector(state => {
    if (entityIs(root, 'Card') && root.id != null) {
      const card = state.cards.cards[root.id];
      if (card != null) {
        if (card.contents === undefined) {
          return undefined;
        } else if (card.contents === null) {
          return null;
        } else {
          const contents = Object.values(card.contents);
          if (contents.length === 0) {
            return null;
          } else {
            return state.cards.contents[contents[0]!]!.content;
          }
        }
      }
    }
  });

  React.useEffect(() => {
    if (window && window.top && window.top.document) {
      if (project) {
        if (project.name) {
          window.top.document.title = project?.name;
        }
      } else {
        window.top.document.title = 'co.LAB';
      }
    }
  }, [project, project?.name]);

  React.useEffect(() => {
    if (entityIs(root, 'Card') && root.id != null && rootContent === undefined) {
      dispatch(API.getCardContents(root.id));
    }
  }, [dispatch, root, rootContent]);

  if (status == 'LOADING') {
    return <InlineLoading />;
  } else if (project == null || project.id == null) {
    return (
      <div>
        <i>{i18n.modules.project.info.noProjectSelected}</i>
      </div>
    );
  } else if (status != 'READY' || typeof root === 'string' || root.id == null) {
    return <InlineLoading />;
  } else {
    return (
      <PresenceContext.Provider value={presenceContext}>
        <Flex direction="column" align="stretch" grow={1} className={css({ height: '100vh' })}>
          <ProjectNav project={project} />
          <Flex
            direction="column"
            grow={1}
            align="stretch"
            className={css({
              overflow: 'auto',
              position: 'relative',
              userSelect: 'none',
            })}
          >
            <Routes>
              <Route
                path="team/*"
                element={
                  <ProjectSidePanelWrapper title={i18n.team.team}>
                    <TeamTabsPanel />
                  </ProjectSidePanelWrapper>
                }
              />
              <Route
                path="project-settings/*"
                element={
                  <ProjectSidePanelWrapper title={i18n.modules.project.labels.projectSettings}>
                    <ProjectSettingsTabs projectId={project.id} />
                  </ProjectSidePanelWrapper>
                }
              />
              <Route
                path="docs/*"
                element={
                  <ProjectSidePanelWrapper title={i18n.modules.project.settings.resources.label}>
                    <DocumentationTabs project={project} />
                  </ProjectSidePanelWrapper>
                }
              />
              <Route
                path="bin/*"
                element={
                  <ProjectSidePanelWrapper title={i18n.common.bin.pageTitle}>
                    <CardsBin />
                  </ProjectSidePanelWrapper>
                }
              />
              <Route
                path="tasks/*"
                element={
                  <ProjectSidePanelWrapper title={i18n.team.myTasks}>
                    <ProjectTasksPanel />
                  </ProjectSidePanelWrapper>
                }
              />
            </Routes>
            <Routes>
              <Route path="admin/*" element={<AdminTabs />} />
              <Route path="settings/*" element={<SettingsTabs />} />
              <Route path="hierarchy" element={<HierarchyPanel rootId={root.id} />} />
              <Route path="flow" element={<ActivityFlowChartPanel />} />
              <Route path="listview" element={<ListViewRoot />} />

              <Route path="card/:cardId" element={<DefaultVariantDetector />} />

              <Route
                path="card/:cardId/v/:vId/*"
                element={
                  // <CardWrapper grow={1} backButtonPath={'../.'}>
                  <CardWrapper grow={1}>
                    {(card, variant) => <CardEditor card={card} cardContent={variant} />}
                  </CardWrapper>
                }
              />

              <Route
                path="hierarchy/card/:cardId/v/:vId/*"
                element={
                  // <CardWrapper grow={1} backButtonPath={'../.'}>
                  <CardWrapper grow={1}>
                    {(card, variant) => <CardEditor card={card} cardContent={variant} />}
                  </CardWrapper>
                }
              />

              {/* All cards. Root route */}
              <Route path="*" element={<RootView rootContent={rootContent} />} />
            </Routes>
          </Flex>
        </Flex>
      </PresenceContext.Provider>
    );
  }
}

const DefaultVariantDetector = (): JSX.Element => {
  const { cardId: id } = useParams<'cardId'>();
  const cardId = +id!;

  const variant = useDefaultVariant(cardId);

  if (entityIs(variant, 'CardContent')) {
    return <Navigate to={`v/${variant.id}`} replace />;
  } else {
    return <InlineLoading />;
  }
};
