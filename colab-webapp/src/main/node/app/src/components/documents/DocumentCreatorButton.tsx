/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import { invertedButtonStyle, space_S } from '../styling/style';
import { DocumentContext, DocumentType } from './documentCommonType';

const addButtonStyle = css({ marginRight: space_S });

export type DocumentCreatorButtonProps = {
  creationContext: DocumentContext;
  docType: DocumentType;
  title: string;
  label: string | React.ReactNode;
};

export default function DocumentCreatorButton({
  creationContext,
  docType,
  title,
  label,
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
          cardContentId: creationContext.ownerId,
          deliverable: document,
        }),
      );
    } else if (creationContext.kind == 'PartOfResource') {
      dispatch(
        API.addDocumentToResource({
          resourceId: creationContext.ownerId,
          document: document,
        }),
      );
    }
  }, [creationContext, docType, dispatch]);

  return (
    <Button className={cx(invertedButtonStyle, addButtonStyle)} title={title} onClick={createDoc}>
      {label}
    </Button>
  );
}
