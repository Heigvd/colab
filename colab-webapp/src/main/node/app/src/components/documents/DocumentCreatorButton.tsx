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
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import IconButton, { IconButtonProps } from '../common/element/IconButton';
import DropDownMenu from '../common/layout/DropDownMenu';
import { DocumentKind, DocumentOwnership } from './documentCommonType';

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
  docOwnership: DocumentOwnership;
  title: string;
  selectedDocumentId: number | null;
  isAdditionAlwaysAtEnd?: boolean;
  docKind: DocumentKind;
  className?: string;
};

export default function DocumentCreatorButton({
  docOwnership,
  selectedDocumentId,
  title,
  isAdditionAlwaysAtEnd,
  docKind,
  className,
}: DocumentCreatorButtonProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const createDoc = React.useCallback(
    (place?: 'BEFORE' | 'AFTER') => {
      if (selectedDocumentId != null) {
        if (place === 'BEFORE') {
          if (docOwnership.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableBefore({
                cardContentId: docOwnership.ownerId,
                neighbourDocId: selectedDocumentId,
                docKind: docKind,
              }),
            );
          } else if (docOwnership.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceBefore({
                resourceId: docOwnership.ownerId,
                neighbourDocId: selectedDocumentId,
                docKind: docKind,
              }),
            );
          }
        } else if (place === 'AFTER') {
          if (docOwnership.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableAfter({
                cardContentId: docOwnership.ownerId,
                neighbourDocId: selectedDocumentId,
                docKind: docKind,
              }),
            );
          } else if (docOwnership.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAfter({
                resourceId: docOwnership.ownerId,
                neighbourDocId: selectedDocumentId,
                docKind: docKind,
              }),
            );
          }
        }
      } else {
        if (place === 'BEFORE') {
          if (docOwnership.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableAtBeginning({
                cardContentId: docOwnership.ownerId,
                docKind: docKind,
              }),
            );
          } else if (docOwnership.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAtBeginning({
                resourceId: docOwnership.ownerId,
                docKind: docKind,
              }),
            );
          }
        } else {
          if (docOwnership.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableAtEnd({
                cardContentId: docOwnership.ownerId,
                docKind: docKind,
              }),
            );
          } else if (docOwnership.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAtEnd({
                resourceId: docOwnership.ownerId,
                docKind: docKind,
              }),
            );
          }
        }
      }
    },
    [docOwnership.kind, docOwnership.ownerId, dispatch, selectedDocumentId, docKind],
  );

  return (
    <>
      {isAdditionAlwaysAtEnd ? (
        <IconButton
          icon={iconByType(docKind)}
          layer={iconLayerByType(docKind)}
          title={title}
          onClick={() => createDoc('AFTER')}
          className={className}
        />
      ) : (
        <DropDownMenu
          icon={iconByType(docKind)}
          layerForIcon={iconLayerByType(docKind)}
          title={title}
          valueComp={{ value: '', label: '' }}
          buttonClassName={className}
          entries={[
            {
              value: selectedDocumentId != null ? 'before' : 'begin',
              label:
                selectedDocumentId != null
                  ? i18n.modules.content.before
                  : i18n.modules.content.onTop,
              action: () => createDoc('BEFORE'),
            },
            {
              value: selectedDocumentId != null ? 'after' : 'end',
              label:
                selectedDocumentId != null ? i18n.modules.content.after : i18n.modules.content.end,
              action: () => createDoc('AFTER'),
            },
          ]}
        />
      )}
    </>
  );
}
