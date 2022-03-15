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
import { DocumentContext, DocumentKind } from './documentCommonType';

const addButtonStyle = css({ marginRight: space_S });

export type DocumentCreatorButtonProps = {
  context: DocumentContext;
  docKind: DocumentKind;
  title: string;
  label: string | React.ReactNode;
};

export default function DocumentCreatorButton({
  context,
  docKind,
  title,
  label,
}: DocumentCreatorButtonProps): JSX.Element {
  const dispatch = useAppDispatch();

  const createDoc = React.useCallback(() => {
    if (context.kind == 'DeliverableOfCardContent') {
      dispatch(
        API.addDeliverable({
          cardContentId: context.ownerId,
          docKind: docKind,
        }),
      );
    } else if (context.kind == 'PartOfResource') {
      dispatch(
        API.addDocumentToResource({
          resourceId: context.ownerId,
          docKind: docKind,
        }),
      );
    }
  }, [context, docKind, dispatch]);

  return (
    <Button className={cx(invertedButtonStyle, addButtonStyle)} title={title} onClick={createDoc}>
      {label}
    </Button>
  );
}
