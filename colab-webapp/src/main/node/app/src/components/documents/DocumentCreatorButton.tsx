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
import { DocumentContext, DocumentType } from './documentCommonType';

const addButtonStyle = css({ marginTop: '20px', display: 'block' });

export type DocumentCreatorButtonProps = {
  creationContext: DocumentContext;
  docType: DocumentType;
  title: string;
};

export default function DocumentCreatorButton({
  creationContext,
  docType,
  title,
}: DocumentCreatorButtonProps): JSX.Element {
  const dispatch = useAppDispatch();

  const createDoc = React.useCallback(() => {
    let document = null;
    if (docType == 'DocumentFile') {
      document = {
        '@class': docType,
        fileSize: 0,
        mimeType: 'application/octet-stream',
      };
    } else if (docType == 'TextDataBlock') {
      document = {
        '@class': docType,
        mimeType: 'text/markdown',
        revision: '0',
      };
    } else {
      document = {
        '@class': docType,
      };
    }

    if (creationContext.kind == 'DeliverableOfCardContent') {
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
      invertedButton
    >
      {title}
    </Button>
  );
}
