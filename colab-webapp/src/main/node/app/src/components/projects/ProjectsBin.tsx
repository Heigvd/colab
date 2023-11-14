/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useMyDeletedProjectsAndModels } from '../../store/selectors/projectSelector';
import {
  deleteForeverDefaultIcon,
  dropDownMenuDefaultIcon,
  restoreFromBinDefaultIcon,
  viewDetailDefaultIcon,
} from '../../styling/IconDefault';
import {
  binDateColumnStyle,
  binDropDownMenuButtonStyle,
  binDropDownMenuStyle,
  binNameColumnStyle,
  binTBodyStyle,
  binTableStyle,
  p_3xl,
  space_xl,
} from '../../styling/style';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { ProjectName } from './ProjectName';

// TODO : see if scroll can be only on tbody
// TODO : opaque color on header

// TODO : "Empty bin" action

export default function ProjectsBin(): JSX.Element {
  const i18n = useTranslations();

  const projects: Project[] = useMyDeletedProjectsAndModels().projects || [];

  if (projects.length == 0) {
    return (
      <Flex justify="center" className={p_3xl}>
        {i18n.common.bin.info.isEmpty}
      </Flex>
    );
  }

  return (
    <Flex direction="column" className={css({ padding: space_xl })}>
      {/* align="stretch" */}
      <table className={binTableStyle}>
        <thead>
          <tr>
            <th className={binNameColumnStyle}>{i18n.common.bin.name}</th>
            <th className={binDateColumnStyle}>{i18n.common.bin.dateBinned}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className={binTBodyStyle}>
          {projects.map(project => (
            <ProjectBinRow key={project.id} project={project} />
          ))}
        </tbody>
      </table>
    </Flex>
  );
}

function ProjectBinRow({ project }: { project: Project }): JSX.Element {
  const i18n = useTranslations();

  return (
    <tr>
      <td>
        <ProjectName project={project} />
      </td>
      <td>
        {project.trackingData?.erasureTime != null
          ? i18n.common.dateFn(project.trackingData!.erasureTime)
          : ''}
      </td>
      <td>
        <Flex justify="flex-end">
          <BinDropDownMenu project={project} />
        </Flex>
      </td>
    </tr>
  );
}

function BinDropDownMenu({ project }: { project: Project }): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const showDeletedProject = React.useCallback(() => {
    window.open(`#/editor/${project.id!}`, '_blank');
  }, [project]);

  return (
    <DropDownMenu
      icon={dropDownMenuDefaultIcon}
      className={binDropDownMenuStyle}
      buttonClassName={binDropDownMenuButtonStyle}
      entries={[
        {
          value: 'view',
          label: (
            <>
              <Icon icon={viewDetailDefaultIcon} /> {i18n.common.bin.action.view}
            </>
          ),
          action: () => {
            showDeletedProject();
          },
        },
        {
          value: 'restore',
          label: (
            <>
              <Icon icon={restoreFromBinDefaultIcon} /> {i18n.common.bin.action.restore}
            </>
          ),
          action: () => {
            dispatch(API.restoreProjectFromBin(project));
          },
        },
        {
          value: 'deleteForever',
          label: (
            <>
              <Icon icon={deleteForeverDefaultIcon} /> {i18n.common.bin.action.deleteForever}
            </>
          ),
          action: () => {
            dispatch(API.deleteProjectForever(project));
          },
        },
      ]}
    />
  );
}
