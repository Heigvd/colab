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
  faCog,
  faDownload,
  faExternalLinkAlt,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import DropDownMenu from '../common/DropDownMenu';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import { DocumentOwnership } from '../documents/documentCommonType';
import DocumentCreatorButton from '../documents/DocumentCreatorButton';
import { lightIconButtonStyle, space_M, space_S } from '../styling/style';
import { CardEditorCTX } from './CardEditor';

// TODO : do not change height when a bloc is selected

const toolboxContainerStyle = css({
  height: 'auto',
  maxHeight: '400px',
  //minHeight: '30px',
  overflow: 'hidden',
  padding: space_S,
  transition: 'all .5s ease',
  borderBottom: '2px solid var(--darkGray)',
});

const closedToolboxStyle = css({
  maxHeight: '0px',
  paddingTop: '0px',
  paddingBottom: '0px',
});

const borderRightStyle = css({
  paddingRight: space_S,
  marginRight: space_S,
  borderRight: '1px solid var(--lightGray)',
});

const toolboxButtonStyle = cx(
  lightIconButtonStyle,
  css({
    paddingRight: space_S,
    margin: space_S,
  }),
);

interface Props {
  open: boolean;
  docOwnership: DocumentOwnership;
  prefixElement?: React.ReactNode;
}

export default function CardEditorToolbox({
  open,
  docOwnership,
  prefixElement,
}: Props): JSX.Element {
  const { setSelectedId, selectedId, setEditMode, TXToptions, editToolbar } =
    React.useContext(CardEditorCTX);
  const showTree = TXToptions?.showTree || false;
  const dispatch = useAppDispatch();

  const selectedDocument = useAppSelector(state => {
    let document = undefined;
    if (selectedId) {
      const doc = state.document.documents[selectedId];
      if (entityIs(doc, 'Document')) {
        document = doc;
      }
      return document;
    }
  });

  const isText = entityIs(selectedDocument, 'TextDataBlock');
  const isLink = entityIs(selectedDocument, 'ExternalLink');
  const isDoc = entityIs(selectedDocument, 'DocumentFile');

  const downloadUrl = API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(selectedId!);

  const downloadCb = React.useCallback(() => {
    window.open(downloadUrl);
  }, [downloadUrl]);

  const openUrl = React.useCallback(url => {
    window.open(url);
  }, []);

  return (
    <Flex align="center" className={cx(toolboxContainerStyle, { [closedToolboxStyle]: !open })}>
      {prefixElement}
      <BlockCreatorButtons docOwnership={docOwnership} selectedBlockId={selectedId || null} />
      {selectedDocument != (undefined || null) && (
        <>
          {isText && (
            <>
              {editToolbar}
              <DropDownMenu
                icon={faCog}
                valueComp={{ value: '', label: '' }}
                buttonClassName={cx(
                  lightIconButtonStyle,
                  css({
                    paddingLeft: space_M,
                    marginLeft: space_M,
                    borderLeft: '1px solid var(--lightGray)',
                  }),
                )}
                entries={[
                  {
                    value: 'markDown',
                    label: (
                      <>
                        {TXToptions?.markDownMode && (
                          <FontAwesomeIcon icon={faCheck} size="xs" color="var(--lightGray)" />
                        )}{' '}
                        MarkDown mode
                      </>
                    ),
                    action: () => TXToptions?.setMarkDownMode(markDownMode => !markDownMode),
                  },
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
                    action: () => TXToptions?.setShowTree(showTree => !showTree),
                  },
                ]}
              />
            </>
          )}
          {isDoc && selectedDocument.fileName && (
            <IconButton
              icon={faDownload}
              title={'Download file'}
              className={lightIconButtonStyle}
              onClick={() => downloadCb()}
            />
          )}
          {isLink && selectedDocument.url && selectedDocument.url.length > 0 && (
            <IconButton
              icon={faExternalLinkAlt}
              title={'Open url in new tab'}
              className={lightIconButtonStyle}
              onClick={() => openUrl(selectedDocument.url)}
            />
          )}
          {!isText && (
            <IconButton
              icon={faPen}
              title="edit block"
              className={toolboxButtonStyle}
              onClick={() => setEditMode(true)}
            />
          )}
          <ConfirmDeleteModal
            confirmButtonLabel={'Delete ' + (isText ? 'text' : isLink ? 'link' : 'doc')}
            buttonLabel={
              <>
                <IconButton
                  icon={faTrash}
                  title="Delete block"
                  onClick={() => {}}
                  className={toolboxButtonStyle}
                />
              </>
            }
            message={
              <p>
                Are you <strong>sure</strong> you want to delete this whole block? This will be lost
                forever.
              </p>
            }
            onConfirm={() => {
              if (selectedId) {
                if (selectedDocument.owningCardContentId != null) {
                  dispatch(
                    API.removeDeliverable({
                      cardContentId: selectedDocument.owningCardContentId,
                      documentId: selectedId,
                    }),
                  );
                } else if (selectedDocument.owningResourceId != null) {
                  dispatch(
                    API.removeDocumentOfResource({
                      resourceId: selectedDocument.owningResourceId,
                      documentId: selectedId,
                    }),
                  );
                }
              }
              setSelectedId(undefined);
            }}
          />
          <div
            className={css({
              marginLeft: space_S,
              paddingLeft: space_S,
              borderLeft: '1px solid var(--lightGray)',
            })}
          >
            <IconButton
              icon={faArrowUp}
              title={'Move block up'}
              className={lightIconButtonStyle}
              onClick={() => {
                dispatch(API.moveDocumentUp(selectedId!));
              }}
            />
            <IconButton
              icon={faArrowDown}
              title={'Move block down'}
              className={lightIconButtonStyle}
              onClick={() => {
                dispatch(API.moveDocumentDown(selectedId!));
              }}
            />
          </div>
        </>
      )}
    </Flex>
  );
}

interface BlockButtonsProps {
  docOwnership: DocumentOwnership;
  selectedBlockId: number | null;
}

export function BlockCreatorButtons({
  docOwnership,
  selectedBlockId,
}: BlockButtonsProps): JSX.Element {
  return (
    <>
      <Flex className={cx({ [borderRightStyle]: !!selectedBlockId })}>
        <DocumentCreatorButton
          docOwnership={docOwnership}
          selectedBlockId={selectedBlockId}
          docKind="TextDataBlock"
          title="add a text block"
          className={toolboxButtonStyle}
        />
        <DocumentCreatorButton
          docOwnership={docOwnership}
          selectedBlockId={selectedBlockId}
          docKind="DocumentFile"
          title="add a file"
          className={toolboxButtonStyle}
        />
        <DocumentCreatorButton
          docOwnership={docOwnership}
          selectedBlockId={selectedBlockId}
          docKind="ExternalLink"
          title="add a link"
          className={toolboxButtonStyle}
        />
      </Flex>
    </>
  );
}
