/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { useLastInsertedDocId } from '../../selectors/documentSelector';
import * as DocumentActions from '../../store/documentSlice';
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import OpenGraphLink from '../common/element/OpenGraphLink';
import Flex from '../common/layout/Flex';
import { editableBlockStyle } from '../styling/style';
import { DocumentOwnership } from './documentCommonType';
import { DocEditorCTX } from './DocumentEditorToolbox';
import DocumentFileEditor from './DocumentFileEditor';

const selectedStyle = css({
  border: '1px solid var(--darkGray)',
  '&:hover': {
    border: '1px solid var(--darkGray)',
  },
});

const noBorderStyle = css({
  border: '1px solid transparent',
  '&:hover': {
    border: '1px solid transparent',
  },
});

export interface DocumentEditorProps {
  doc: Document;
  allowEdition?: boolean;
  docOwnership: DocumentOwnership;
}

export default function DocumentEditor({
  doc,
  allowEdition = true,
  docOwnership,
}: DocumentEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const lastInsertedDocId = useLastInsertedDocId(docOwnership);

  const isTextDataBlock = entityIs(doc, 'TextDataBlock');
  const isDocumentFile = entityIs(doc, 'DocumentFile');
  const isExternalLink = entityIs(doc, 'ExternalLink');

  const dropRef = React.useRef<HTMLDivElement>(null);

  const { setSelectedDocId, selectedDocId, editMode, setEditMode, TXToptions } =
    React.useContext(DocEditorCTX);

  const selected = doc.id === selectedDocId;
  const editing = editMode && selected;

  const onSelect = React.useCallback(() => {
    if (doc.id != selectedDocId) {
      setEditMode(false);
    }
    setSelectedDocId(doc.id);
  }, [doc.id, selectedDocId, setEditMode, setSelectedDocId]);

  React.useEffect(() => {
    if (lastInsertedDocId === doc.id) {
      setSelectedDocId(lastInsertedDocId);
      setEditMode(true);
      dispatch(DocumentActions.resetLastInsertedDocId({ docOwnership }));
    }
  }, [dispatch, doc.id, docOwnership, lastInsertedDocId, setEditMode, setSelectedDocId]);

  return (
    <Flex>
      <div
        ref={dropRef}
        className={cx(
          editableBlockStyle,
          css({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexGrow: 1,
            padding: 0,
            maxWidth: '21cm',
          }),
          { [selectedStyle]: selected && !isTextDataBlock },
          { [noBorderStyle]: isTextDataBlock },
        )}
        onClick={onSelect}
        onDoubleClick={() => setEditMode(true)}
      >
        {isTextDataBlock ? (
          <BlockEditorWrapper
            blockId={doc.id!}
            allowEdition={allowEdition}
            editingStatus={true}
            showTree={TXToptions?.showTree}
            markDownEditor={TXToptions?.markDownMode}
            className={css({ flexGrow: 1 })}
            selected={selected}
            flyingToolBar
          />
        ) : isDocumentFile ? (
          <DocumentFileEditor
            document={doc}
            allowEdition={allowEdition}
            editingStatus={editing}
            setEditingState={setEditMode}
          />
        ) : isExternalLink ? (
          <OpenGraphLink
            url={doc.url || ''}
            editingStatus={editing}
            document={doc}
            setEditingState={setEditMode}
          />
        ) : (
          <div>
            <i>Unknown document</i>
          </div>
        )}
      </div>
    </Flex>
  );
}
