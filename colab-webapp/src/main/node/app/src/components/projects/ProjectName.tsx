/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations, { ColabTranslations } from '../../i18n/I18nContext';

export function ProjectName({ project }: { project: Project }): JSX.Element {
  const i18n = useTranslations();

  return <>{getProjectName({ project, i18n })}</>;
}

export function getProjectName({
  project,
  i18n,
}: {
  project: Project;
  i18n: ColabTranslations;
}): string {
  return project.name || i18n.modules.project.actions.newProject;
}
