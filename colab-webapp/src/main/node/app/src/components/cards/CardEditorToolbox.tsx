/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import Button from '../common/Button';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import { DocumentContext } from '../documents/documentCommonType';
import DocumentCreatorButton from '../documents/DocumentCreatorButton';
import { space_S } from '../styling/style';
import { CardEditorCTX } from './CardEditor';

const toolboxContainerStyle = css({
  height: 'auto',
  maxHeight: '400px',
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

const toolboxButtonStyle = css({
  paddingRight: space_S,
  margin: space_S,
});

interface Props {
  open: boolean;
  context: DocumentContext;
  prefixElement?: React.ReactNode;
}

export default function CardEditorToolbox({ open, context, prefixElement }: Props): JSX.Element {
  const { setSelectedId, selectedId, editMode, setEditMode } = React.useContext(CardEditorCTX);
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

  const endEdit = React.useCallback(() => {
    setEditMode(false);
    setSelectedId(undefined);
  }, [setEditMode, setSelectedId]);

  return (
    <Flex align="center" className={cx(toolboxContainerStyle, { [closedToolboxStyle]: !open })}>
      {prefixElement}
      <BlockCreatorButtons context={context} blockSelected={selectedId != (undefined || null)} />
      {selectedDocument != (undefined || null) && (
        <>
          {editMode ? (
            <>
              {entityIs(selectedDocument, 'TextDataBlock') && <div>BUTTONS TEXT</div>}
              {entityIs(selectedDocument, 'DocumentFile') && <div>BUTTONS Files</div>}
              {entityIs(selectedDocument, 'ExternalLink') && <div>BUTTONS Links</div>}
              <Button onClick={endEdit}>OK</Button>
            </>
          ) : (
            <IconButton
              icon={faPen}
              title="edit block"
              className={toolboxButtonStyle}
              onClick={() => setEditMode(true)}
            />
          )}
          <ConfirmDeleteModal
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
            confirmButtonLabel={'Delete data'}
          />
        </>
      )}
    </Flex>
  );
}

interface BlockButtonsProps {
  context: DocumentContext;
  blockSelected: boolean;
}

export function BlockCreatorButtons({ context, blockSelected }: BlockButtonsProps): JSX.Element {
  return (
    <>
      <Flex className={cx({ [borderRightStyle]: blockSelected })}>
        <DocumentCreatorButton
          context={context}
          docKind="TextDataBlock"
          title="add a text block"
          className={toolboxButtonStyle}
        />
        <DocumentCreatorButton
          context={context}
          docKind="DocumentFile"
          title="add a file"
          className={toolboxButtonStyle}
        />
        <DocumentCreatorButton
          context={context}
          docKind="ExternalLink"
          title="add a link"
          className={toolboxButtonStyle}
        />
      </Flex>
    </>
  );
}
