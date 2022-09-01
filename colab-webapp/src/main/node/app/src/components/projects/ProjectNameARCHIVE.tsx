/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import { useProject } from '../../selectors/projectSelector';

interface ProjectNameProps {
  projectId: number;
}

// Display one project and allow to edit it
export function ProjectName({ projectId }: ProjectNameProps): JSX.Element {
  const { project } = useProject(projectId);

  if (entityIs(project, 'Project')) {
    return <> {project.name} </>;
  } else {
    return <>n/a</>;
  }
}
