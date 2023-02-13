/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/element/IconButton';
import DropDownMenu from '../common/layout/DropDownMenu';
import { DocumentKind, DocumentOwnership } from './documentCommonType';
import { DocEditorCtx } from './DocumentEditorToolbox';

function iconByType(docKind: DocumentKind): string {
  if (docKind === 'DocumentFile') {
    return 'file';
  }

  if (docKind === 'ExternalLink') {
    return 'attach_file';
  }

  if (docKind === 'TextDataBlock') {
    return 'paragraph';
  }

  return 'home';
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

  const { setLastCreatedId: setLastCreatedId } = React.useContext(DocEditorCtx);

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
            ).then(action => {
              if (setLastCreatedId != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (entityIs(action.payload, 'Document') && action.payload.id != null) {
                    setLastCreatedId(action.payload.id);
                  }
                }
              }
            });
          } else if (docOwnership.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceBefore({
                resourceId: docOwnership.ownerId,
                neighbourDocId: selectedDocumentId,
                docKind: docKind,
              }),
            ).then(action => {
              if (setLastCreatedId != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (entityIs(action.payload, 'Document') && action.payload.id != null) {
                    setLastCreatedId(action.payload.id);
                  }
                }
              }
            });
          }
        } else if (place === 'AFTER') {
          if (docOwnership.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableAfter({
                cardContentId: docOwnership.ownerId,
                neighbourDocId: selectedDocumentId,
                docKind: docKind,
              }),
            ).then(action => {
              if (setLastCreatedId != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (entityIs(action.payload, 'Document') && action.payload.id != null) {
                    setLastCreatedId(action.payload.id);
                  }
                }
              }
            });
          } else if (docOwnership.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAfter({
                resourceId: docOwnership.ownerId,
                neighbourDocId: selectedDocumentId,
                docKind: docKind,
              }),
            ).then(action => {
              if (setLastCreatedId != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (entityIs(action.payload, 'Document') && action.payload.id != null) {
                    setLastCreatedId(action.payload.id);
                  }
                }
              }
            });
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
            ).then(action => {
              if (setLastCreatedId != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (entityIs(action.payload, 'Document') && action.payload.id != null) {
                    setLastCreatedId(action.payload.id);
                  }
                }
              }
            });
          } else if (docOwnership.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAtBeginning({
                resourceId: docOwnership.ownerId,
                docKind: docKind,
              }),
            ).then(action => {
              if (setLastCreatedId != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (entityIs(action.payload, 'Document') && action.payload.id != null) {
                    setLastCreatedId(action.payload.id);
                  }
                }
              }
            });
          }
        } else {
          if (docOwnership.kind == 'DeliverableOfCardContent') {
            dispatch(
              API.addDeliverableAtEnd({
                cardContentId: docOwnership.ownerId,
                docKind: docKind,
              }),
            ).then(action => {
              if (setLastCreatedId != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (entityIs(action.payload, 'Document') && action.payload.id != null) {
                    setLastCreatedId(action.payload.id);
                  }
                }
              }
            });
          } else if (docOwnership.kind == 'PartOfResource') {
            dispatch(
              API.addDocumentToResourceAtEnd({
                resourceId: docOwnership.ownerId,
                docKind: docKind,
              }),
            ).then(action => {
              if (setLastCreatedId != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (entityIs(action.payload, 'Document') && action.payload.id != null) {
                    setLastCreatedId(action.payload.id);
                  }
                }
              }
            });
          }
        }
      }
    },
    [docOwnership, dispatch, selectedDocumentId, docKind, setLastCreatedId],
  );

  return (
    <>
      {isAdditionAlwaysAtEnd ? (
        <IconButton
          icon={iconByType(docKind)}
          title={title}
          onClick={() => createDoc('AFTER')}
          className={className}
        />
      ) : (
        <DropDownMenu
          icon={iconByType(docKind)}
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
