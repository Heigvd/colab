/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Document, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { updateDocument } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { space_sm } from '../../styling/style';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import OpenGraphLink from '../common/element/OpenGraphLink';
import Flex from '../common/layout/Flex';
import { DocEditorCtx } from './DocumentEditorToolbox';
import DocumentFileEditor from './DocumentFileEditor';

export const editableBlockStyle = css({
  border: '1px solid var(--secondary-fade)',
  margin: '3px 0',
  padding: space_sm,
  borderRadius: '6px',
  '&:hover': {
    cursor: 'pointer',
    border: '1px solid var(--divider-main)',
  },
});

const selectedStyle = css({
  border: '1px solid var(--secondary-main)',
  '&:hover': {
    border: '1px solid var(--secondary-main)',
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
  readOnly?: boolean;
}

export default function DocumentEditor({
  doc,
  readOnly = false,
}: DocumentEditorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { lastCreatedId, setLastCreatedId } = React.useContext(DocEditorCtx);

  const isTextDataBlock = entityIs(doc, 'TextDataBlock');
  const isDocumentFile = entityIs(doc, 'DocumentFile');
  const isExternalLink = entityIs(doc, 'ExternalLink');

  //const dropRef = React.useRef<HTMLDivElement>(null);

  const { setSelectedDocId, selectedDocId, editMode, setEditMode, TXToptions } =
    React.useContext(DocEditorCtx);

  const selected = doc.id === selectedDocId;
  const editing = editMode && selected;

  const onSelect = React.useCallback(() => {
    if (doc.id != selectedDocId) {
      setEditMode(false);
    }
    if (doc.id != null) {
      setSelectedDocId(doc.id);
    }
  }, [doc.id, selectedDocId, setEditMode, setSelectedDocId]);

  React.useEffect(() => {
    if (lastCreatedId === doc.id) {
      setSelectedDocId(lastCreatedId);
      setEditMode(true);
      setLastCreatedId(null);
    }
  }, [lastCreatedId, doc.id, setSelectedDocId, setEditMode, setLastCreatedId]);

  return (
    <Flex>
      <div
        ref={undefined /*dropRef*/}
        className={cx(
          { [editableBlockStyle]: !readOnly },
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
        onDoubleClick={readOnly ? undefined : () => setEditMode(true)}
      >
        {isTextDataBlock ? (
          <BlockEditorWrapper
            blockId={doc.id!}
            readOnly={readOnly}
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
            readOnly={readOnly}
            editingStatus={editing}
            setEditingState={setEditMode}
          />
        ) : isExternalLink ? (
          <OpenGraphLink
            url={doc.url || ''}
            editingStatus={editing}
            readOnly={readOnly}
            editCb={newUrl => {
              dispatch(updateDocument({ ...doc, url: newUrl }));
            }}
            setEditingState={setEditMode}
          />
        ) : (
          <div>
            <i>{i18n.modules.document.unknownDocument}</i>
          </div>
        )}
      </div>
    </Flex>
  );
}
