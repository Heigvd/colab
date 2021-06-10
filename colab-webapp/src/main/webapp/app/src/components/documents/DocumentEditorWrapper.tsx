/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import { BlockDocumentEditor } from './blockdoc/BlockDocumentEditor';

export interface DocEditorProps {
  docId: number;
}

export function DocumentEditorWrapper({ docId }: DocEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const doc = useDocument(docId);

  React.useEffect(() => {
    if (doc == undefined && docId != null) {
      dispatch(API.getDocument(docId));
    }
  }, [doc, docId, dispatch]);

  if (doc == null || doc == 'LOADING') {
    return <InlineLoading />;
  } else {
    if (entityIs(doc, 'BlockDocument')) {
      return <BlockDocumentEditor doc={doc} />;
    } else if (entityIs(doc, 'HostedDocLink')) {
      return (
        <div>
          {' '}
          <i>HostedDocLink not yet implemented (upload new document)</i>{' '}
        </div>
      );
    } else if (entityIs(doc, 'ExternalDocLink')) {
      return (
        <div>
          {' '}
          <i>ExternalDocLink not yet implemented (url thumbnail, url editor)</i>{' '}
        </div>
      );
    } else {
      return (
        <div>
          <i>Unknown document</i>{' '}
        </div>
      );
    }
  }
}
