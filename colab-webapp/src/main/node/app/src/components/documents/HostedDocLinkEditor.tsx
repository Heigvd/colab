/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HostedDocLink } from 'colab-rest-client';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import * as API from '../../API/api';


import * as React from 'react';
import IconButton from '../common/IconButton';

export interface HostedDocLinkProps {
  document: HostedDocLink;
  allowEdition?: boolean;
}

export function HostedDocLinkEditor({ document }: HostedDocLinkProps): JSX.Element {
  const i18n = useTranslations();

  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<'IDLE' | 'LOADING' | 'DONE'>('IDLE');
  
    const onChangeCb = React.useCallback(
    (v: React.ChangeEvent<HTMLInputElement>) => {
      if (v.target.files != null && v.target.files.length > 0) {
        setState('LOADING');
        const file = v.target.files[0];
        if(file){
          dispatch(API.uploadFile({docId: document.id!, file: file })).then(() => setState('DONE'));
        }
      }
    },
    [dispatch],
  );
  
  const downloadCb = React.useCallback(
    () => {
      
    }, []
  )

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
      <h1>Here is your awesome file uploader</h1>
      <h2>{i18n.nothingToDisplay}Translation test</h2>
      <IconButton icon={faDownload} onClick={downloadCb} />
      {document.fileName}
      <div>
        {state === 'IDLE' ? (
          <input type="file" onChange={onChangeCb} accept=".json, .wgz"/>
        ) : state === 'LOADING' ? (
          <InlineLoading />
        ) : (
          <FontAwesomeIcon icon={faCheck} />
        )}
      </div>
    </div>
  );
}
