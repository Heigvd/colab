/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { binAccessDefaultIcon } from '../../styling/IconDefault';
import { br_md, m_sm, p_xs, space_2xs, space_xs } from '../../styling/style';
import { UserDropDown } from '../MainNav';
import Badge from '../common/element/Badge';
import { DiscreetInput } from '../common/element/Input';
import { MainMenuLink } from '../common/element/Link';
import IllustrationDisplay from '../common/element/illustration/IllustrationDisplay';
import Flex from '../common/layout/Flex';
import Icon, { IconSize } from '../common/layout/Icon';
import Monkeys from '../debugger/monkey/Monkeys';
import { ProjectDeletedBanner } from './ProjectDeletedBanner';
import { useIsProjectReadOnly } from './projectRightsHooks';

interface ProjectNavProps {
  project: Project;
}

export function ProjectNav({ project }: ProjectNavProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const { currentUser } = useCurrentUser();

  const readOnly = useIsProjectReadOnly();

  return (
    <Flex direction="column" align="stretch">
      <div
        className={cx(
          css({
            display: 'inline-grid',
            gridTemplateColumns: '1fr 3fr 1fr',
            flexGrow: 0,
            padding: `${space_2xs} 0`,
          }),
        )}
      >
        <Flex align="center">
          <Flex
            className={cx(
              m_sm,
              br_md,
              css({
                alignItems: 'center',
                border: '1px solid var(--divider-main)',
              }),
            )}
            wrap="nowrap"
          >
            <MainMenuLink to={`/project/${project.id}`} end={true}>
              <Icon icon={'dashboard'} title={i18n.common.views.board} />
            </MainMenuLink>
            <MainMenuLink to="./flow">
              <Icon icon={'account_tree'} title={i18n.common.views.activityFlow} />
            </MainMenuLink>
            <MainMenuLink to="./hierarchy">
              <Icon icon={'family_history'} title={i18n.common.views.hierarchy} />
            </MainMenuLink>
            <MainMenuLink to="./listview">
              <Icon icon={'list'} title={i18n.common.views.list} />
            </MainMenuLink>
          </Flex>
        </Flex>
        <div
          className={css({
            gridColumn: '2/3',
            placeSelf: 'center',
            display: 'flex',
            alignItems: 'center',
          })}
        >
          <Flex align="center" gap={space_xs}>
            {project.type === 'MODEL' && (
              <>
                {project.globalProject ? (
                  <Badge kind="outline" theme="warning">
                    {i18n.modules.project.labels.modelScope.global}
                    <Icon icon="public" opsz="xs" className={css('padding: 0 0 0 ' + space_xs)} />
                  </Badge>
                ) : (
                  <Badge kind="outline" theme="warning">
                    {i18n.modules.project.labels.modelScope.normal}
                    <Icon icon="star" opsz="xs" className={css('padding: 0 0 0 ' + space_xs)} />
                  </Badge>
                )}
              </>
            )}
            <IllustrationDisplay
              illustration={project.illustration}
              iconSize="xs"
              containerClassName={cx(
                br_md,
                p_xs,
                css({ width: IconSize.xs + 'px', height: IconSize.xs + 'px' }),
              )}
            />
            <DiscreetInput
              value={project.name || ''}
              placeholder={i18n.modules.project.actions.newProject}
              onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
              readOnly={readOnly}
            />
          </Flex>
        </div>
        <Flex align="center" justify="flex-end">
          {/* <Presence projectId={project.id!} /> */}
          <Monkeys />
          {/* {tipsConfig.FEATURE_PREVIEW.value && (
            <Tips tipsType="FEATURE_PREVIEW" className={css({ color: 'var(--success-main)' })}>
              <Flex>
                <Checkbox
                  label={i18n.tips.label.feature_preview}
                  value={tipsConfig.FEATURE_PREVIEW.value}
                  onChange={tipsConfig.FEATURE_PREVIEW.set}
                  className={css({ display: 'inline-block', marginRight: space_sm })}
                />
              </Flex>
            </Tips>
          )} */}
          <MainMenuLink to="./tasks">
            <Icon icon={'checklist'} title={i18n.team.myTasks} />
          </MainMenuLink>
          <MainMenuLink to="./team">
            <Icon icon={'group'} title={i18n.team.teamManagement} />
          </MainMenuLink>
          <MainMenuLink to="./docs">
            <Icon icon={'menu_book'} title={i18n.modules.project.settings.resources.label} />
          </MainMenuLink>

          <MainMenuLink to="./bin">
            <Icon icon={binAccessDefaultIcon} title={i18n.common.bin.action.seeBin} />
          </MainMenuLink>

          <MainMenuLink to="./project-settings">
            <Icon title={i18n.modules.project.labels.projectSettings} icon={'settings'} />
          </MainMenuLink>

          {currentUser?.admin && (
            <MainMenuLink to="./admin">
              <Icon icon={'admin_panel_settings'} title={i18n.admin.adminPanel} />
            </MainMenuLink>
          )}
          <UserDropDown />
        </Flex>
      </div>
      <ProjectDeletedBanner project={project} />
    </Flex>
  );
}
