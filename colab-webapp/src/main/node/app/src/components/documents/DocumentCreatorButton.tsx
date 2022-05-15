/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faFile, faFrog, faLink, faParagraph, faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import DropDownMenu from '../common/DropDownMenu';
import { IconButtonProps } from '../common/IconButton';
import { DocumentContext, DocumentKind } from './documentCommonType';

function iconByType(docKind: DocumentKind): IconProp {
  if (docKind === 'DocumentFile') {
    return faFile;
  }

  if (docKind === 'ExternalLink') {
    return faLink;
  }

  if (docKind === 'TextDataBlock') {
    return faParagraph;
  }

  return faFrog;
}

function iconLayerByType(docKind: DocumentKind): IconButtonProps['layer'] {
  if (docKind === 'DocumentFile') {
    return { layerIcon: faPlus, transform: 'shrink-3 left-12 down-2' };
  }

  if (docKind === 'ExternalLink') {
    return { layerIcon: faPlus, transform: 'shrink-3 left-14 down-3' };
  }

  if (docKind === 'TextDataBlock') {
    return { layerIcon: faPlus, transform: 'shrink-3 left-9 down-5' };
  }
}

export type DocumentCreatorButtonProps = {
  context: DocumentContext;
  title: string;
  // isFirstDoc?: boolean;
  docKind: DocumentKind;
  selectedBlockId: number | null;
  className?: string;
};

export default function DocumentCreatorButton({
  context,
  title,
  // isFirstDoc,
  selectedBlockId,
  docKind,
  className,
}: DocumentCreatorButtonProps): JSX.Element {
  const dispatch = useAppDispatch();

  const createDoc = React.useCallback(
    (place?: 'BEFORE' | 'AFTER') => {
      if (selectedBlockId) {
        if (place === 'BEFORE') {
          if (context.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableBefore({
                cardContentId: context.ownerId,
                neighbourDocId: selectedBlockId,
                docKind: docKind,
              }),
            );
          } else if (context.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceBefore({
                resourceId: context.ownerId,
                neighbourDocId: selectedBlockId,
                docKind: docKind,
              }),
            );
          }
        } else if (place === 'AFTER') {
          if (context.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableAfter({
                cardContentId: context.ownerId,
                neighbourDocId: selectedBlockId,
                docKind: docKind,
              }),
            );
          } else if (context.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAfter({
                resourceId: context.ownerId,
                neighbourDocId: selectedBlockId,
                docKind: docKind,
              }),
            );
          }
        }
      } else {
        if (place === 'BEFORE') {
          if (context.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableAtBeginning({
                cardContentId: context.ownerId,
                docKind: docKind,
              }),
            );
          } else if (context.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAtBeginning({
                resourceId: context.ownerId,
                docKind: docKind,
              }),
            );
          }
        } else {
          if (context.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableAtEnd({
                cardContentId: context.ownerId,
                docKind: docKind,
              }),
            );
          } else if (context.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAtEnd({
                resourceId: context.ownerId,
                docKind: docKind,
              }),
            );
          }
        }
      }
    },
    [context.kind, context.ownerId, selectedBlockId, dispatch, docKind],
  );

  return (
    // <>
    //   {isFirstDoc ? (
    //     <IconButton
    //       icon={iconByType(docKind)}
    //       layer={iconLayerByType(docKind)}
    //       title={title}
    //       onClick={() => createDoc('AFTER')}
    //       className={className}
    //     />
    //   ) : (
    <DropDownMenu
      icon={iconByType(docKind)}
      layerForIcon={iconLayerByType(docKind)}
      title={title}
      valueComp={{ value: '', label: '' }}
      buttonClassName={className}
      entries={[
        {
          value: 'before',
          label: 'Before',
          action: () => createDoc('BEFORE'),
        },
        {
          value: 'after',
          label: 'After',
          action: () => createDoc('AFTER'),
        },
      ]}
    />
    //   )}
    // </>
  );
}
