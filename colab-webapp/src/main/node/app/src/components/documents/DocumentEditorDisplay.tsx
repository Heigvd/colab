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
import Button from '../common/Button';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import Flex from '../common/Flex';
import { EditState } from '../live/LiveEditor';
import {
  editableBlockStyle,
  invertedButtonStyle,
  lightIconButtonStyle,
  space_S,
} from '../styling/style';
import { DocumentFileEditor } from './DocumentFileEditor';
import { ExternalLinkEditor } from './ExternalLinkEditor';

const editingStyle = css({
  backgroundColor: 'var(--hoverBgColor)',
  border: '1px solid transparent',
});

export interface DocumentEditorDisplayProps {
  document: Document;
  allowEdition?: boolean;
}

export function DocumentEditorDisplay({
  document,
  allowEdition = true,
}: DocumentEditorDisplayProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [state, setState] = React.useState<EditState>({
    status: 'VIEW',
  });

  return (
    <div
      className={cx(
        css({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }),
        editableBlockStyle,
        { [editingStyle]: state.status === 'EDIT' },
      )}
      onClick={() => {
        if (state.status === 'VIEW') {
          setState({ ...state, status: 'EDIT' });
        }
      }}
    >
      {entityIs(document, 'TextDataBlock') ? (
        <BlockEditorWrapper
          blockId={document.id!}
          allowEdition={allowEdition}
          editingStatus={state}
          className={css({ flexGrow: 1 })}
        />
      ) : entityIs(document, 'DocumentFile') ? (
        <DocumentFileEditor document={document} allowEdition={allowEdition} />
      ) : entityIs(document, 'ExternalLink') ? (
        <ExternalLinkEditor document={document} allowEdition={allowEdition} />
      ) : (
        <div>
          <i>Unknown document</i>
        </div>
      )}
      <Flex direction="column" align='flex-end' justify='space-between'>
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
        {state.status === 'EDIT' &&
          <Button className={invertedButtonStyle} onClick={() => {
            setState({ ...state, status: 'VIEW' });
          }}>Ok</Button>
        }
        
      </Flex>
    </div>
  );
}
