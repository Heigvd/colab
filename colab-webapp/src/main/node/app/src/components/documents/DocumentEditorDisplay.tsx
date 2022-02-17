/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import { lightIconButtonStyle, space_S } from '../styling/style';
import { DocumentFileEditor } from './DocumentFileEditor';
import { ExternalLinkEditor } from './ExternalLinkEditor';

export interface DocumentEditorDisplayProps {
  document: Document;
  allowEdition?: boolean;
}

export function DocumentEditorDisplay({
  document,
  allowEdition = true,
}: DocumentEditorDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      })}
    >
      {entityIs(document, 'TextDataBlock') ? (
        <BlockEditorWrapper blockId={document.id!} allowEdition={allowEdition} />
      ) : entityIs(document, 'DocumentFile') ? (
        <DocumentFileEditor document={document} allowEdition={allowEdition} />
      ) : entityIs(document, 'ExternalLink') ? (
        <ExternalLinkEditor document={document} allowEdition={allowEdition} />
      ) : (
        <div>
          <i>Unknown document</i>
        </div>
      )}

      <DropDownMenu
        icon={faEllipsisV}
        valueComp={{ value: '', label: '' }}
        buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
        entries={[
          {
            value: 'Delete',
            label: (
              <ConfirmDeleteModal
                buttonLabel={
                  <>
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </>
                }
                message={
                  <p>
                    Are you <strong>sure</strong> you want to delete this data? This will be lost
                    forever.
                  </p>
                }
                onConfirm={() => {
                  if (document.id) {
                    if (document.owningCardContentId != null) {
                      dispatch(
                        API.removeDeliverable({
                          cardContentId: document.owningCardContentId,
                          documentId: document.id,
                        }),
                      );
                    } else if (document.owningResourceId != null) {
                      dispatch(
                        API.removeDocumentOfResource({
                          resourceId: document.owningResourceId,
                          documentId: document.id,
                        }),
                      );
                    }
                  }
                }}
                confirmButtonLabel={'Delete data'}
              />
            ),
          },
        ]}
        onSelect={val => {
          val.action && val.action();
        }}
      />
    </div>
  );
}
