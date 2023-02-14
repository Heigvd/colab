/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadNbDocuments } from '../../selectors/documentSelector';
import { useUrlMetadata } from '../../selectors/externalDataSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { idleStyle, toggledStyle } from '../blocks/markdown/WysiwygEditor';
import IconButton from '../common/element/IconButton';
import ConfirmDeleteOpenCloseModal from '../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { lightIconButtonStyle, space_lg, space_sm } from '../styling/style';
import { DocumentOwnership } from './documentCommonType';
import DocumentCreatorButton from './DocumentCreatorButton';

const toolboxContainerStyle = css({
  height: 'auto',
  maxHeight: '400px',
  minHeight: '30px',
  overflow: 'hidden',
  padding: space_sm,
  transition: 'all .5s ease',
  borderBottom: '2px solid var(--secondary-main)',
});

const closedToolboxStyle = css({
  minHeight: '0px',
  maxHeight: '0px',
  paddingTop: '0px',
  paddingBottom: '0px',
});

const borderRightStyle = css({
  paddingRight: space_sm,
  marginRight: space_sm,
  borderRight: '1px solid var(--divider-main)',
});

const toolboxButtonStyle = cx(
  lightIconButtonStyle,
  css({
    paddingRight: space_sm,
    margin: space_sm,
  }),
);

interface DocEditorToolboxProps {
  open: boolean;
  docOwnership: DocumentOwnership;
  //prefixElement?: React.ReactNode;
}

interface TXToptionsType {
  showTree: boolean;
  setShowTree: React.Dispatch<React.SetStateAction<boolean>>;
  markDownMode: boolean;
  setMarkDownMode: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DocEditorContext {
  selectedDocId: number | null;
  setSelectedDocId: (id: number | null) => void;
  lastCreatedId: number | null;
  setLastCreatedId: (id: number | null) => void;
  editMode: boolean;
  setEditMode: (editMode: boolean) => void;
  TXToptions?: TXToptionsType;
  editToolbar: JSX.Element;
  setEditToolbar: React.Dispatch<React.SetStateAction<JSX.Element>>;
}

export const defaultDocEditorContext: DocEditorContext = {
  selectedDocId: null,
  setSelectedDocId: () => {},
  lastCreatedId: null,
  setLastCreatedId: () => {},
  editMode: false,
  setEditMode: () => {},
  editToolbar: <></>,
  setEditToolbar: () => {},
};

export const DocEditorCtx = React.createContext<DocEditorContext>(defaultDocEditorContext);

export default function DocEditorToolbox({
  open,
  docOwnership,
}: //prefixElement,
DocEditorToolboxProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { setSelectedDocId, selectedDocId, setEditMode, TXToptions, editToolbar } =
    React.useContext(DocEditorCtx);

  const showTree = TXToptions?.showTree || false;

  const selectedDocument = useAppSelector(state => {
    if (selectedDocId) {
      const doc = state.document.documents[selectedDocId];
      if (entityIs(doc, 'Document')) {
        //make sure selected document is part of the current document owner
        if (
          (docOwnership.kind === 'DeliverableOfCardContent' &&
            doc.owningCardContentId === docOwnership.ownerId) ||
          (docOwnership.kind === 'PartOfResource' && doc.owningResourceId === docOwnership.ownerId)
        ) {
          return doc;
        }
        return undefined;
      }
    }
  });

  const isText = entityIs(selectedDocument, 'TextDataBlock');
  const isLink = entityIs(selectedDocument, 'ExternalLink');
  const isDoc = entityIs(selectedDocument, 'DocumentFile');

  const downloadUrl = selectedDocument?.id
    ? API.getRestClient().DocumentFileRestEndPoint.getFileContentPath(selectedDocument.id!)
    : '';

  const downloadCb = React.useCallback(() => {
    window.open(downloadUrl);
  }, [downloadUrl]);

  const openUrl = React.useCallback((url: string | null | undefined) => {
    if (url) {
      window.open(url);
    }
  }, []);

  return (
    <Flex align="center" className={cx(toolboxContainerStyle, { [closedToolboxStyle]: !open })}>
      {/*prefixElement*/}
      <BlockCreatorButtons
        docOwnership={docOwnership}
        selectedBlockId={selectedDocument?.id ?? null}
      />
      {selectedDocument != (undefined || null) && (
        <>
          {isText && (
            <>
              {!TXToptions?.markDownMode && editToolbar}
              <IconButton
                icon={'code'}
                title={i18n.modules.content.mdMode}
                className={TXToptions?.markDownMode ? toggledStyle : idleStyle}
                onClick={() => TXToptions?.setMarkDownMode(markDownMode => !markDownMode)}
              />
              <DropDownMenu
                icon={'settings'}
                valueComp={{ value: '', label: '' }}
                buttonClassName={cx(
                  lightIconButtonStyle,
                  css({
                    paddingLeft: space_lg,
                    marginLeft: space_lg,
                    borderLeft: '1px solid var(--divider-main)',
                  }),
                )}
                entries={[
                  {
                    value: 'markDown',
                    label: (
                      <>
                        {TXToptions?.markDownMode && (
                           <Icon icon={'check'} opsz="xs" color="var(--divider-main)" />
                        )}{' '}
                        {i18n.modules.content.mdMode}
                      </>
                    ),
                    action: () => TXToptions?.setMarkDownMode(markDownMode => !markDownMode),
                  },
                  {
                    value: 'showTree',
                    label: (
                      <>
                        {showTree && (
                           <Icon icon={'check'} opsz="xs" color="var(--divider-main)" />
                        )}{' '}
                        {i18n.modules.content.showTree}
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
              icon={'download'}
              title={i18n.modules.content.dlFile}
              className={lightIconButtonStyle}
              onClick={() => downloadCb()}
            />
          )}
          {isLink && selectedDocument.url && selectedDocument.url.length > 0 && (
            <OpenLinkButton
              url={selectedDocument.url}
              openUrl={() => openUrl(selectedDocument.url)}
            />
          )}
          {!isText && (
            <IconButton
              icon={'edit'}
              title={i18n.modules.content.editBlock}
              className={toolboxButtonStyle}
              onClick={() => setEditMode(true)}
            />
          )}
          {/* FUTUR FEATURE <DropDownMenu
            icon={faFlag}
            buttonClassName={cx(
              lightIconButtonStyle,
              css({
                paddingLeft: space_M,
                marginLeft: space_M,
                borderLeft: '1px solid var(--divider-main)',
              }),
            )}
            valueComp={{ value: '', label: '' }}
            menuIcon="CARET"
            entries={[
              {
                value: 'decision',
                label: (
                  <>
                     <Icon icon={'check'} size="xs" color="var(--divider-main)" />{' '}
                    Decision
                  </>
                ),
                action: () => {},
              },
              {
                value: 'validation',
                label: (
                  <>
                     <Icon icon={'check'} size="xs" color="var(--divider-main)" />{' '}
                    Validation
                  </>
                ),
                action: () => {},
              },
            ]}
          /> */}
          <ConfirmDeleteOpenCloseModal
            title={i18n.modules.content.deleteBlock}
            confirmButtonLabel={i18n.modules.content.deleteBlockType(isText, isLink)}
            buttonLabel={
              <>
                <IconButton
                  icon={'delete'}
                  title={i18n.modules.content.deleteBlock}
                  onClick={() => {}}
                  className={toolboxButtonStyle}
                />
              </>
            }
            message={<p>{i18n.modules.content.confirmDeleteBlock}</p>}
            onConfirm={() => {
              if (selectedDocument.id != null) {
                if (selectedDocument.owningCardContentId != null) {
                  dispatch(
                    API.removeDeliverable({
                      cardContentId: selectedDocument.owningCardContentId,
                      documentId: selectedDocument.id,
                    }),
                  );
                } else if (selectedDocument.owningResourceId != null) {
                  dispatch(
                    API.removeDocumentOfResource({
                      resourceId: selectedDocument.owningResourceId,
                      documentId: selectedDocument.id,
                    }),
                  );
                }
              }
              setSelectedDocId(null);
            }}
          />
          <div
            className={css({
              marginLeft: space_sm,
              paddingLeft: space_sm,
              borderLeft: '1px solid var(--divider-main)',
            })}
          >
            <IconButton
              icon={'arrow_upward'}
              title={i18n.modules.content.moveBlockUpDown('up')}
              className={lightIconButtonStyle}
              onClick={() => {
                dispatch(API.moveDocumentUp(selectedDocument.id!));
              }}
            />
            <IconButton
              icon={'arrow_downward'}
              title={i18n.modules.content.moveBlockUpDown('down')}
              className={lightIconButtonStyle}
              onClick={() => {
                dispatch(API.moveDocumentDown(selectedDocument.id!));
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
  const { nb } = useAndLoadNbDocuments(docOwnership);
  const i18n = useTranslations();

  return (
    <>
      <Flex className={cx({ [borderRightStyle]: !!selectedBlockId })}>
        <DocumentCreatorButton
          docOwnership={docOwnership}
          docKind="TextDataBlock"
          selectedDocumentId={selectedBlockId}
          title={i18n.modules.content.addText}
          className={toolboxButtonStyle}
          isAdditionAlwaysAtEnd={nb < 1}
        />
        <DocumentCreatorButton
          docOwnership={docOwnership}
          docKind="DocumentFile"
          selectedDocumentId={selectedBlockId}
          title={i18n.modules.content.addFile}
          className={toolboxButtonStyle}
          isAdditionAlwaysAtEnd={nb < 1}
        />
        <DocumentCreatorButton
          docOwnership={docOwnership}
          docKind="ExternalLink"
          selectedDocumentId={selectedBlockId}
          title={i18n.modules.content.addLink}
          className={toolboxButtonStyle}
          isAdditionAlwaysAtEnd={nb < 1}
        />
      </Flex>
    </>
  );
}

interface OpenLinkButtonProps {
  url: string;
  openUrl: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent> | React.KeyboardEvent<HTMLSpanElement>,
  ) => void;
}

function OpenLinkButton({ url, openUrl }: OpenLinkButtonProps): JSX.Element {
  const metadata = useUrlMetadata(url);
  const i18n = useTranslations();

  return (
    <>
      {metadata != 'LOADING' && metadata != 'NO_URL' && !metadata.broken && (
        <IconButton
          icon={'open_in_new'}
          title={i18n.modules.document.openInNewTab}
          className={lightIconButtonStyle}
          onClick={openUrl}
        />
      )}
    </>
  );
}
