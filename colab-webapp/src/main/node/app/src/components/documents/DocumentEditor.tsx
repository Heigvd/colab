/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faDownload,
  faEllipsisV,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import { CardEditorCTX } from '../cards/CardEditor';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OpenGraphLink from '../common/OpenGraphLink';
import { EditState } from '../live/LiveEditor';
import { editableBlockStyle, lightIconButtonStyle, space_S } from '../styling/style';
import DocumentFileEditor from './DocumentFileEditor';

const editingStyle = css({
  backgroundColor: 'var(--hoverBgColor)',
  border: '1px solid transparent',
});

const moveBoxStyle = css({
  '&:hover #moveBox': {
    opacity: 1,
    transition: 'opacity .8s ease',
  },
});

export interface DocumentEditorProps {
  doc: Document;
  allowEdition: boolean;
}

export default function DocumentEditor({ doc, allowEdition }: DocumentEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const isTextDataBlock = entityIs(doc, 'TextDataBlock');
  const isDocumentFile = entityIs(doc, 'DocumentFile');
  const isExternalLink = entityIs(doc, 'ExternalLink');

  const [state, setState] = React.useState<EditState>('VIEW');
  const [showTree, setShowTree] = React.useState(false);
  const [markDownMode, setmarkDownMode] = React.useState(false);
  const dropRef = React.useRef<HTMLDivElement>(null);

  const {setSelectedId} = React.useContext(CardEditorCTX);

  const handleClickOutside = (event: Event) => {
    if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
      setState('VIEW');
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });


  const downloadUrl = API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(doc.id!);

  const downloadCb = React.useCallback(() => {
    window.open(downloadUrl);
  }, [downloadUrl]);

  return (
    <Flex className={moveBoxStyle}>
      <div
        ref={dropRef}
        className={cx(
          css({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexGrow: 1,
          }),
          editableBlockStyle,
          { [editingStyle]: state === 'EDIT' },
        )}
        onClick={() => setSelectedId(doc.id)}
        /* onClick={() => {
          if (state === 'VIEW') {
            setState('EDIT');
          }
        }} */
      >
        {isTextDataBlock ? (
          <BlockEditorWrapper
            blockId={doc.id!}
            allowEdition={allowEdition}
            editingStatus={state}
            showTree={showTree}
            markDownEditor={markDownMode}
            className={css({ flexGrow: 1 })}
          />
        ) : isDocumentFile ? (
          <DocumentFileEditor
            document={doc}
            allowEdition={allowEdition}
            editingStatus={state}
            setEditingState={setState}
          />
        ) : isExternalLink ? (
          <OpenGraphLink
            url={doc.url || ''}
            editingStatus={state}
            document={doc}
            setEditingState={setState}
          />
        ) : (
          <div>
            <i>Unknown document</i>
          </div>
        )}
        <Flex direction="column" align="flex-end" justify="space-between">
          <DropDownMenu
            icon={faEllipsisV}
            valueComp={{ value: '', label: '' }}
            buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
            entries={[
              ...(state === 'VIEW'
                ? [
                    {
                      value: 'EditBlock',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faPen} size="xs" /> Edit
                        </>
                      ),
                      action: () => setState('EDIT'),
                    },
                  ]
                : []),
              ...(isTextDataBlock && state === 'EDIT'
                ? [
                    {
                      value: 'showTree',
                      label: (
                        <>
                          {showTree && (
                            <FontAwesomeIcon icon={faCheck} size="xs" color="var(--lightGray)" />
                          )}{' '}
                          Show tree
                        </>
                      ),
                      action: () => setShowTree(showTree => !showTree),
                    },
                    {
                      value: 'markDown',
                      label: (
                        <>
                          {markDownMode && (
                            <FontAwesomeIcon icon={faCheck} size="xs" color="var(--lightGray)" />
                          )}{' '}
                          MarkDown mode
                        </>
                      ),
                      action: () => setmarkDownMode(markDownMode => !markDownMode),
                    },
                  ]
                : []),
              ...(isDocumentFile &&
              (doc.mimeType === 'image/png' || doc.mimeType === 'image/jpeg') &&
              state === 'VIEW'
                ? [
                    {
                      value: 'download image',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faDownload} size="xs" /> Download image
                        </>
                      ),
                      action: () => downloadCb(),
                    },
                  ]
                : []),
              {
                value: 'Delete',
                label: (
                  <ConfirmDeleteModal
                    buttonLabel={
                      <>
                        <FontAwesomeIcon icon={faTrash} size="xs" /> Delete
                      </>
                    }
                    message={
                      <p>
                        Are you <strong>sure</strong> you want to delete this data? This will be
                        lost forever.
                      </p>
                    }
                    onConfirm={() => {
                      if (doc.id) {
                        if (doc.owningCardContentId != null) {
                          dispatch(
                            API.removeDeliverable({
                              cardContentId: doc.owningCardContentId,
                              documentId: doc.id,
                            }),
                          );
                        } else if (doc.owningResourceId != null) {
                          dispatch(
                            API.removeDocumentOfResource({
                              resourceId: doc.owningResourceId,
                              documentId: doc.id,
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
        </Flex>
      </div>
      <Flex direction="column" className={css({ paddingLeft: space_S, opacity: 0 })} id="moveBox">
        <IconButton
          icon={faArrowUp}
          title="Move block up"
          iconSize="xs"
          className={lightIconButtonStyle}
          onClick={() => {
            dispatch(API.moveDocumentUp(doc.id!));
          }}
        />
        <IconButton
          icon={faArrowDown}
          title="Move block down"
          iconSize="xs"
          className={lightIconButtonStyle}
          onClick={() => {
            dispatch(API.moveDocumentDown(doc.id!));
          }}
        />
      </Flex>
    </Flex>
  );
}
