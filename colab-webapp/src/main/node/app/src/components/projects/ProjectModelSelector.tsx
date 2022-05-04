/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useProject } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';

interface ProjectModelSelectorProps {
  onSelect: (value: Project | null) => void;
}

// TODO project filter

export default function ProjectModelSelector({ onSelect }: ProjectModelSelectorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { project, status } = useProject(4);

  React.useEffect(() => {
    if (project === undefined && status === 'NOT_INITIALIZED') {
      dispatch(API.getUserProjects());
    }
  }, [project, status, dispatch]);

  React.useEffect(() => {
    if (project) {
      onSelect(project);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return <div>select the model project</div>;
}
