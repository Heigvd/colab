/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';

const addButtonStyle = css({ marginTop: '20px', display: 'block' });

export enum CreationContextKind {
  CardContent,
  Resource,
}

export type CreationCardContentContext = {
  kind: CreationContextKind.CardContent;
  cardContentId: number;
}

export type CreationResourceContext = {
  kind: CreationContextKind.Resource;
  resourceId: number;
}

export type CreationContext = CreationCardContentContext | CreationResourceContext;

type documentType = 'TextDataBlock' | 'ExternalLink' | 'DocumentFile';

export type DocumentCreatorProps = {
  creationContext: CreationContext;
  docType: documentType;
  title: string;
};

export default function DocumentCreator({
  creationContext,
  docType,
  title,
}: DocumentCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const createDoc = React.useCallback(() => {
    let document = null;
    if (docType == 'DocumentFile') {
      document = {
        '@class': docType,
        fileSize: 0,
        mimeType: 'application/octet-stream',
      };
    }
    else if (docType == 'TextDataBlock') {
      document = {
        '@class': docType,
        mimeType: 'text/markdown',
        revision: '0',
      }
    } else {
      document = {
        '@class': docType,
      }
    }

    if (creationContext.kind == CreationContextKind.CardContent) {
      dispatch(
        API.addDeliverable({
          cardContentId: creationContext.cardContentId,
          deliverable: document,
        }),
      );
    } else {
      dispatch(
        API.addDocumentToResource({
          resourceId: creationContext.resourceId,
          document: document,
        }),
      );
    }
  }, [creationContext, docType, dispatch]);

  return (
    <Button
      className={addButtonStyle}
      icon={faPlus}
      title={title}
      onClick={createDoc}
    >
      {title}
    </Button>
  );
}

