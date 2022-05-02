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
import { useAppDispatch } from '../../store/hooks';
import { BlockEditorWrapper } from '../blocks/BlockEditorWrapper';
import { CardEditorCTX } from '../cards/CardEditor';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OpenGraphLink from '../common/OpenGraphLink';
import { editableBlockStyle, lightIconButtonStyle, space_S } from '../styling/style';
import DocumentFileEditor from './DocumentFileEditor';

const editingStyle = css({
  backgroundColor: 'var(--hoverBgColor)',
  border: '1px solid transparent',
});
const selectedStyle = css({
  border: '1px solid var(--darkGray)',
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

  const dropRef = React.useRef<HTMLDivElement>(null);

  const { setSelectedId, selectedId, editMode, setEditMode, TXToptions } =
    React.useContext(CardEditorCTX);

  const selected = doc.id === selectedId;
  const editing = editMode && selected;

  /*   const handleClickOutside = (event: Event) => {
    if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
      //WHY DOESN T WORK?
      //setEditMode(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }); */

  const onSelect = React.useCallback(() => {
    setSelectedId(doc.id);
  }, [doc.id, setSelectedId]);

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
          { [selectedStyle]: selected },
          { [editingStyle]: editing },
        )}
        onClick={onSelect}
      >
        {isTextDataBlock ? (
          <BlockEditorWrapper
            blockId={doc.id!}
            allowEdition={allowEdition}
            editingStatus={editing}
            showTree={TXToptions?.showTree}
            markDownEditor={TXToptions?.markDownMode}
            className={css({ flexGrow: 1 })}
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
