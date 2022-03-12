/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DocumentFile } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import FilePicker from '../common/FilePicker';
import InlineLoading from '../common/InlineLoading';
import { EditState } from '../live/LiveEditor';

export interface DocumentFileProps {
  document: DocumentFile;
  allowEdition?: boolean;
  editingStatus: EditState;
}

export default function DocumentFileEditor({
  document,
  allowEdition,
  editingStatus,
}: DocumentFileProps): JSX.Element {
  //const i18n = useTranslations();

  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<'IDLE' | 'LOADING' | 'DONE'>('IDLE');

  const onChangeCb = React.useMemo(
    () =>
      allowEdition
        ? (file: File) => {
            dispatch(API.uploadFile({ docId: document.id!, file: file, fileSize: file.size })).then(
              () => setState('DONE'),
            );
          }
        : undefined,
    [dispatch, document.id, allowEdition],
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
      currentPreviewImgUrl={document.mimeType.startsWith('image/') ? downloadUrl : undefined}
      currentFilename={
        state === 'LOADING' ? (
          <InlineLoading />
        ) : state === 'DONE' ? (
          <FontAwesomeIcon icon={faCheck} />
        ) : (
          document.fileName
        )
      }
      currentMimetype={document.mimeType}
      editingStatus={editingStatus}
    />
  );
}
