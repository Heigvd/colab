/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';

import { useProjectBeingEdited, useAppDispatch } from '../../../store/hooks';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../../common/IconButton';

export default (): JSX.Element => {
  const dispatch = useAppDispatch();
  const project = useProjectBeingEdited();

  if (project == null) {
    return (
      <div>
        <i>Error: no project selected</i>
      </div>
    );
  } else {
    return (
      <div>
        <div>Edit project #{project.id}</div>
        <IconButton onClick={() => dispatch(API.closeCurrentProject())} icon={faTimes} />
      </div>
    );
  }
};
