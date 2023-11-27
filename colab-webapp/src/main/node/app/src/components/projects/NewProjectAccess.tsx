/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { addNotification } from '../../store/slice/notificationSlice';

/**
 * Show a notification that a new project is accessible.
 */
export default function NewProjectAccess(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { projectId } = useParams<'projectId'>();

  React.useEffect(() => {
    dispatch(
      addNotification({
        status: 'OPEN',
        type: 'INFO',
        message: i18n.modules.project.info.newProjectAccess,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Navigate to={'/editor/' + projectId} />;
}
