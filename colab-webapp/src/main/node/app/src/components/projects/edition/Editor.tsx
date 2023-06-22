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
import Admin from '../../admin/Admin';
import CardEditor from '../../cards/CardEditor';
import RootView from '../../cards/CardRootView';
import CardWrapper from '../../cards/CardWrapper';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import { PresenceContext, usePresenceContext } from '../../presence/PresenceContext';
import Settings from '../../settings/Settings';
import ProjectTasksPanel from '../../team/ProjectTasksList';
import TeamTabs from '../../team/TeamTabs';
import ActivityFlowChart from '../activityFlow/ActivityFlowChart';
import DocumentationTab from '../DocumentationTab';
import Hierarchy from '../hierarchy/Hierarchy';
import ListViewRoot from '../ListView/ListViewRoot';
import { ProjectNav } from '../ProjectNav';
import { ProjectSettingsTabs } from '../settings/ProjectSettingsTabs';
import ProjectSidePanelWrapper from '../SidePanelWrapper';

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
          window.top.document.title = 'co.LAB - ' + project?.name;
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
                    <TeamTabs />
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
                    <DocumentationTab project={project} />
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
              <Route path="admin/*" element={<Admin />} />
              <Route path="settings/*" element={<Settings />} />
              <Route path="hierarchy" element={<Hierarchy rootId={root.id} />} />
              <Route path="flow" element={<ActivityFlowChart />} />
              <Route path="listview" element={<ListViewRoot />} />

              <Route path="card/:id" element={<DefaultVariantDetector />} />
              {/* Zooom on a card */}
              <Route
                path="card/:id/v/:vId/*"
                element={
                  // <CardWrapper grow={1} backButtonPath={'../.'}>
                  <CardWrapper grow={1}>
                    {(card, variant) => <CardEditor card={card} variant={variant} />}
                  </CardWrapper>
                }
              />

              <Route
                path="hierarchy/card/:id/v/:vId/*"
                element={
                  // <CardWrapper grow={1} backButtonPath={'../.'}>
                  <CardWrapper grow={1}>
                    {(card, variant) => <CardEditor card={card} variant={variant} />}
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
  const { id } = useParams<'id'>();
  const cardId = +id!;

  const variant = useDefaultVariant(cardId);

  if (entityIs(variant, 'CardContent')) {
    return <Navigate to={`v/${variant.id}`} />;
  } else {
    return <InlineLoading />;
  }
};
