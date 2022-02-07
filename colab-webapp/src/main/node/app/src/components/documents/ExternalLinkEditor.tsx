/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { ExternalLink } from 'colab-rest-client';
import * as React from 'react';
import { updateDocument } from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/IconButton';
import OpenGraphLink from '../common/OpenGraphLink';

export interface ExternalLinkProps {
  document: ExternalLink;
  allowEdition?: boolean;
}

export function ExternalLinkEditor({ document }: ExternalLinkProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [edit, setEdit] = React.useState(false);
  const [url, setUrl] = React.useState(document.url || '');
  const toggleEdit = React.useCallback(() => {
    setEdit(s => !s);
  }, []);

  const updateDocCb = React.useCallback(() => {
    dispatch(updateDocument({ ...document, url: url }));
    setEdit(false);
  }, [dispatch, document, url]);

  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  }, []);

  return (
    <div>
      {edit ? (
        <>
          <input value={url} onChange={onChange} />
          <IconButton title="save" icon={faCheck} onClick={updateDocCb} />
        </>
      ) : (
        <OpenGraphLink url={document.url || ''} editCb={toggleEdit} />
      )}
    </div>
  );
}
