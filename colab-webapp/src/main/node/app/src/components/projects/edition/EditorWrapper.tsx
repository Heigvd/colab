/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useCurrentProject, useProject } from '../../../store/selectors/projectSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Icon from '../../common/layout/Icon';
import Loading from '../../common/layout/Loading';
import Editor from '../../projects/edition/Editor';

interface EditorWrapperProps {
  projectId: number | undefined;
}

export default function EditorWrapper({ projectId }: EditorWrapperProps) {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const { project, status } = useProject(projectId!);
  const { project: editedProject, status: editingStatus } = useCurrentProject();

  const webSocketId = useAppSelector(state => state.websockets.sessionId);
  const socketIdRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (webSocketId && project != null) {
      if (
        editingStatus === 'NOT_EDITING' ||
        (editedProject != null && editedProject.id !== projectId)
      ) {
        socketIdRef.current = webSocketId;
        dispatch(API.startProjectEdition(project));
      } else if (editingStatus === 'READY') {
        if (webSocketId !== socketIdRef.current) {
          // ws reconnection occured => reconnect
          socketIdRef.current = webSocketId;
          dispatch(API.reconnectToProjectChannel(project));
        }
      }
    }
  }, [dispatch, editingStatus, editedProject, project, projectId, webSocketId]);

  if (projectId == null) {
    return <AvailabilityStatusIndicator status="ERROR" />;
  }
  if (status === 'NOT_INITIALIZED' || status === 'LOADING') {
    return <Loading />;
  } else if (project == null || status === 'ERROR') {
    return (
      <div>
        <Icon icon={'skull'} />
        <span> {i18n.modules.project.info.noProject}</span>
      </div>
    );
  } else {
    if (
      editingStatus === 'NOT_EDITING' ||
      (editedProject != null && editedProject.id !== projectId)
    ) {
      return <Loading />;
    } else {
      return <Editor />;
    }
  }
}
