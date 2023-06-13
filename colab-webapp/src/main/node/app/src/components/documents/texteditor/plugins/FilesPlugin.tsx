/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
  LexicalEditor,
} from 'lexical';
import * as React from 'react';
import { useEffect, useState } from 'react';
import * as API from '../../../../API/api';
import logger from '../../../../logger';
import { useAppDispatch } from '../../../../store/hooks';
import Button from '../../../common/element/Button';
import { $createFileNode, FileNode, FilePayload } from '../nodes/FileNode';
import { DialogActions } from '../ui/Dialog';

export type InsertFilePayload = Readonly<FilePayload>;

export const INSERT_FILE_COMMAND: LexicalCommand<InsertFilePayload> =
  createCommand('INSERT_FILE_COMMAND');

type FileInputProps = Readonly<{
  'data-test-id'?: string;
  accept?: string;
  label: string;
  onChange: (files: FileList | null) => void;
}>;

function FileInput({
  accept,
  label,
  onChange,
  'data-test-id': dataTestId,
}: FileInputProps): JSX.Element {
  return (
    <div className="Input__wrapper">
      <label className="Input__label">{label}</label>
      <input
        type="file"
        accept={accept}
        className="Input__input"
        onChange={e => onChange(e.target.files)}
        data-test-id={dataTestId}
      />
    </div>
  );
}

export function InsertFileUploadDialogBody({
  onClick,
  activeEditor,
}: {
  onClick: (payload: File) => void;
  docId: number;
  activeEditor: LexicalEditor;
}) {
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
        label="File Upload"
        onChange={uploadFile}
        accept="file/*"
        data-test-id="file-modal-file-uplaod"
      />
      <DialogActions>
        <Button
          data-test-id="file-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={() => onClick(loadedFile!)}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export function InsertFileDialog({
  activeEditor,
  onClose,
  docId: activeEditorId,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
  docId: number;
}): JSX.Element {
  const dispatch = useAppDispatch();

  const onClick = (file: File) => {
    dispatch(API.addFile({ cardContentId: activeEditorId, file: file, fileSize: file.size })).then(
      payload => {
        activeEditor.dispatchCommand(INSERT_FILE_COMMAND, {
          docId: Number(payload.payload),
          fileName: file.name,
        });
      },
    );

    onClose();
  };

  return (
    <>
      <InsertFileUploadDialogBody
        onClick={onClick}
        docId={activeEditorId}
        activeEditor={activeEditor}
      />
    </>
  );
}

export default function FilesPlugin({
  activeEditorId,
}: {
  activeEditorId: number;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!editor.hasNodes([FileNode])) {
      throw new Error('FilesPlugin: FileNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertFilePayload>(
        INSERT_FILE_COMMAND,
        payload => {
          const fileNode = $createFileNode(payload);
          $insertNodes([fileNode]);
          if ($isRootOrShadowRoot(fileNode.getParentOrThrow())) {
            $wrapNodeInElement(fileNode, $createParagraphNode).selectEnd();
          }
          fileNode.insertAfter($createParagraphNode());

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [dispatch, activeEditorId, editor]);

  return null;
}
