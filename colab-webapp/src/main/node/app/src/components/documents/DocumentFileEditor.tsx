/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { DocumentFile } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import FilePicker from '../common/element/FilePicker';
import InlineLoading from '../common/element/InlineLoading';
import Icon from '../common/layout/Icon';

export interface DocumentFileProps {
  document: DocumentFile;
  readOnly: boolean;
  editingStatus: boolean;
  setEditingState: (editMode: boolean) => void;
}

export default function DocumentFileEditor({
  document,
  readOnly,
  editingStatus,
  setEditingState,
}: DocumentFileProps): JSX.Element {
  //const i18n = useTranslations();

  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<'IDLE' | 'LOADING' | 'DONE'>('IDLE');

  const onChangeCb = React.useMemo(
    () =>
      !readOnly
        ? (file: File) => {
            setState('LOADING');
            return dispatch(
              API.uploadFile({ docId: document.id!, file: file, fileSize: file.size }),
            ).then(() => setState('DONE'));
          }
        : undefined,
    [dispatch, document.id, readOnly],
  );

  const downloadUrl = API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(document.id!);

  const downloadCb = React.useCallback(() => {
    window.open(downloadUrl);
  }, [downloadUrl]);

  React.useEffect(() => {
    let tId: number | undefined;
    if (state === 'DONE') {
      tId = window.setTimeout(() => {
        setState('IDLE');
      }, 500);
    }
    return () => {
      if (tId != null) {
        window.clearTimeout(tId);
      }
    };
  }, [state]);

  return (
    <FilePicker
      accept="*"
      onChange={onChangeCb}
      onDownload={downloadCb}
      currentPreviewImgUrl={
        document.mimeType.startsWith('image/')
          ? downloadUrl + '?t=' + document.trackingData?.modificationDate
          : undefined
      }
      currentFilename={
        state === 'LOADING' ? (
          <InlineLoading />
        ) : state === 'DONE' ? (
           <Icon icon={'check'} />
        ) : (
          document.fileName
        )
      }
      currentMimetype={document.mimeType}
      editingStatus={editingStatus}
      setEditingState={setEditingState}
      readOnly={readOnly}
    />
  );
}
