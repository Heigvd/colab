/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useLastInsertedDocId } from '../../selectors/documentSelector';
import * as DocumentActions from '../../store/documentSlice';
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import { CardEditorCTX } from '../cards/CardEditor';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OpenGraphLink from '../common/OpenGraphLink';
import { editableBlockStyle, lightIconButtonStyle } from '../styling/style';
import { DocumentOwnership } from './documentCommonType';
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

const moveBoxStyle = css({
  '&:hover #moveBox': {
    opacity: 1,
    transition: 'opacity .8s ease',
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

  const { setSelectedId, selectedId, setSelectedOwnKind, editMode, setEditMode, TXToptions } =
    React.useContext(CardEditorCTX);

  const selected = doc.id === selectedId;
  const editing = editMode && selected;

  const onSelect = React.useCallback(() => {
    if (doc.id != selectedId) {
      setEditMode(false);
    }
    setSelectedId(doc.id);
    setSelectedOwnKind(docOwnership.kind);
  }, [doc.id, docOwnership.kind, selectedId, setEditMode, setSelectedId, setSelectedOwnKind]);

  React.useEffect(() => {
    if (lastInsertedDocId === doc.id) {
      setSelectedId(lastInsertedDocId);
      setEditMode(true);
      dispatch(DocumentActions.resetLastInsertedDocId({ docOwnership }));
    }
  }, [dispatch, doc.id, docOwnership, lastInsertedDocId, setEditMode, setSelectedId]);

  return (
    <Flex className={moveBoxStyle}>
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
      <Flex direction="column" className={css({ opacity: 0 })} id="moveBox">
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
