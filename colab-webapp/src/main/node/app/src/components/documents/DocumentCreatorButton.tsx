/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faFile, faLink, faParagraph, faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/IconButton';
import { DocumentContext, DocumentKind } from './documentCommonType';

export type DocumentCreatorButtonProps = {
  context: DocumentContext;
  docKind: DocumentKind;
  title: string;
  className?: string;
};

export default function DocumentCreatorButton({
  context,
  docKind,
  title,
  className,
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
    <>
      {docKind === 'DocumentFile' && (
        <IconButton
          icon={faFile}
          title={title}
          layer={{ layerIcon: faPlus, transform: 'shrink-3 left-12 down-2' }}
          onClick={createDoc}
          className={className}
        />
      )}
      {docKind === 'ExternalLink' && (
        <IconButton
          icon={faLink}
          title={title}
          layer={{ layerIcon: faPlus, transform: 'shrink-3 left-14 down-3' }}
          onClick={createDoc}
          className={className}
        />
      )}
      {docKind === 'TextDataBlock' && (
        <IconButton
          icon={faParagraph}
          title={title}
          layer={{ layerIcon: faPlus, transform: 'shrink-3 left-9 down-5' }}
          onClick={createDoc}
          className={className}
        />
      )}
    </>
  );
}
