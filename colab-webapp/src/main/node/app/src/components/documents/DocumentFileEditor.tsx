/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DocumentFile } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
//import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import InlineLoading from '../common/InlineLoading';

export interface DocumentFileProps {
  document: DocumentFile;
  allowEdition?: boolean;
}

export function DocumentFileEditor({ document }: DocumentFileProps): JSX.Element {
  //const i18n = useTranslations();

  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<'IDLE' | 'LOADING' | 'DONE'>('IDLE');

  const onChangeCb = React.useCallback(
    (v: React.ChangeEvent<HTMLInputElement>) => {
      if (v.target.files != null && v.target.files.length > 0) {
        setState('LOADING');
        const file = v.target.files[0];

        if (file) {
          dispatch(API.uploadFile({ docId: document.id!, file: file, fileSize: file.size })).then(
            () => setState('DONE'),
          );
        }
      }
    },
    [dispatch, document.id],
  );

  const downloadCb = React.useCallback(() => {
    const downloadUrl = API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(
      document.id!,
    );
    window.open(downloadUrl);
  }, [document.id]);

  React.useEffect(() => {
    let tId: number | undefined;
    if (state === 'DONE') {
      //setState('FADING_OUT');
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
    <div>
      <h3>Here is your awesome file uploader</h3>
      <Button icon={faDownload} onClick={downloadCb} />
      {document.fileName}
      <div>
        {state === 'IDLE' ? (
          <input type="file" onChange={onChangeCb} />
        ) : state === 'LOADING' ? (
          <InlineLoading />
        ) : (
          <FontAwesomeIcon icon={faCheck} />
        )}
      </div>
    </div>
  );
}
