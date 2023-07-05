/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand, LexicalEditor } from 'lexical';
import * as React from 'react';
import { useEffect, useState } from 'react';
import * as API from '../../../../API/api';
import useTranslations from '../../../../i18n/I18nContext';
import logger from '../../../../logger';
import { useAppDispatch } from '../../../../store/hooks';
import Button from '../../../common/element/Button';
import { DocumentOwnership } from '../../documentCommonType';
import { $createFileNode, FileNode, FilePayload } from '../nodes/FileNode';
import { DialogActions } from '../ui/Dialog';
import FileInput from '../ui/FileInput';

export type InsertFilePayload = Readonly<FilePayload>;

export const INSERT_FILE_COMMAND: LexicalCommand<InsertFilePayload> =
  createCommand('INSERT_FILE_COMMAND');

export function InsertFileUploadDialogBody({
  onClick,
  activeEditor,
}: {
  onClick: (payload: File) => void;
  activeEditor: LexicalEditor;
}) {
  const i18n = useTranslations();

  const [loadedFile, setLoadedFile] = useState<File | null>(null);

  const isDisabled = !activeEditor.isEditable;

  const uploadFile = (files: FileList | null) => {
    if (files != null && files.length > 0) {
      const file = files[0];
      if (file != null) {
        setLoadedFile(file);
        logger.info('loadedFile: ', file);
      }
    }
  };

  return (
    <>
      <FileInput
        label={i18n.modules.content.uploadFile}
        onChange={uploadFile}
        accept="file/*"
        data-test-id="file-modal-file-upload"
      />
      <DialogActions>
        <Button
          data-test-id="file-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={() => onClick(loadedFile!)}
        >
          {i18n.common.confirm}
        </Button>
      </DialogActions>
    </>
  );
}

export function InsertFileDialog({
  activeEditor,
  onClose,
  docOwnership,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
  docOwnership: DocumentOwnership;
}): JSX.Element {
  const dispatch = useAppDispatch();

  const onClick = (file: File) => {
    dispatch(API.addFile({ docOwnership, file, fileSize: file.size })).then(payload => {
      activeEditor.dispatchCommand(INSERT_FILE_COMMAND, {
        docId: Number(payload.payload),
        fileName: file.name,
      });
    });

    onClose();
  };

  return (
    <>
      <InsertFileUploadDialogBody onClick={onClick} activeEditor={activeEditor} />
    </>
  );
}

export default function FilesPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([FileNode])) {
      throw new Error('FilesPlugin: FileNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertFilePayload>(
        INSERT_FILE_COMMAND,
        payload => {
          const fileNode = $createFileNode(payload);
          $insertNodeToNearestRoot(fileNode);

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
