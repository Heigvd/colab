/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  COMMAND_PRIORITY_EDITOR,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
  createCommand,
} from 'lexical';
import * as React from 'react';
import { useEffect, useState } from 'react';
import * as API from '../../../../API/api';
import useTranslations from '../../../../i18n/I18nContext';
import { useAppDispatch } from '../../../../store/hooks';
import Button from '../../../common/element/Button';
import { DocumentOwnership } from '../../documentCommonType';
import { $createFileNode, $isFileNode, FileNode, FilePayload } from '../nodes/FileNode';
import { DialogActions } from '../ui/Dialog';
import FileInput from '../ui/FileInput';
import Flex from '../../../common/layout/Flex';
import { errorTextStyle, space_sm } from '../../../../styling/style';
import { useColabConfig } from '../../../../store/selectors/configSelector';
import { addNotification } from '../../../../store/slice/notificationSlice';

export type InsertFilePayload = Readonly<FilePayload>;

export const INSERT_FILE_COMMAND: LexicalCommand<InsertFilePayload> =
  createCommand('INSERT_FILE_COMMAND');

export function InsertFileUploadDialogBody({
  onClick,
  activeEditor,
  isLoading,
  fileSizeLimit,
}: {
  onClick: (payload: File) => void;
  activeEditor: LexicalEditor;
  isLoading: boolean;
  fileSizeLimit: number;
}) {
  const i18n = useTranslations();
  const [loadedFile, setLoadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const isDisabled = !activeEditor.isEditable || loadedFile == null || error !== '';

  const uploadFile = (files: FileList | null) => {
    if (files != null && files.length > 0) {
      const file = files[0];
      if (file != null) {
        setLoadedFile(file);
        if (file.size >= fileSizeLimit) {
          setError(`${i18n.common.error.fileSizeLimit} ${Math.round(fileSizeLimit / 10 ** 6)}MB`);
        } else {
          setError('');
        }
      }
    }
  };

  return (
    <Flex direction="column" align="center" gap={space_sm}>
      <FileInput onChange={uploadFile} accept="file/*" data-test-id="file-modal-file-upload" />
      {error && <div className={errorTextStyle}>{error}</div>}
      <DialogActions>
        <Button
          data-test-id="file-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={() => onClick(loadedFile!)}
          isLoading={isLoading}
        >
          {i18n.common.confirm}
        </Button>
      </DialogActions>
    </Flex>
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
}): React.ReactElement {
  const dispatch = useAppDispatch();
  const { fileSizeLimit } = useColabConfig();
  const i18n = useTranslations();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onClick = (file: File) => {
    setIsLoading(true);
    if (file.size <= fileSizeLimit) {
      dispatch(API.addFile({ docOwnership, file, fileSize: file.size })).then(payload => {
        activeEditor.dispatchCommand(INSERT_FILE_COMMAND, {
          docId: Number(payload.payload),
          fileName: file.name,
        });
        setIsLoading(false);
        onClose();
      });
    } else {
      dispatch(
        addNotification({
          status: 'OPEN',
          type: 'ERROR',
          message: `${i18n.common.error.fileSizeLimit} ${Math.round(fileSizeLimit / 10 ** 6)}MB`,
        }),
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <InsertFileUploadDialogBody
        onClick={onClick}
        activeEditor={activeEditor}
        isLoading={isLoading}
        fileSizeLimit={fileSizeLimit}
      />
    </>
  );
}

export default function FilesPlugin(): null {
  const dispatch = useAppDispatch();

  const [editor] = useLexicalComposerContext();

  // A map to store all file nodes
  // I did not find any other way to fetch just deleted file nodes otherwise
  const fileNodes = new Map<NodeKey, FileNode>();

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

      // handle aliveness and death of file nodes
      // To do it here ascertains that it works with :
      // create file node, press delete key, replacing selected data, do, undo
      editor.registerMutationListener(FileNode, mutatedNodes => {
        for (const [nodeKey, mutation] of mutatedNodes) {
          if (mutation === 'created') {
            editor.getEditorState().read(() => {
              const fileNode = $getNodeByKey<FileNode>(nodeKey);
              if ($isFileNode(fileNode)) {
                fileNodes.set(nodeKey, fileNode);
                dispatch(API.assertFileIsAlive({ docId: fileNode.__docId }));
              }
            });
          } else if (mutation === 'destroyed') {
            const fileNode = fileNodes.get(nodeKey);
            if (fileNode != null) {
              dispatch(API.assertFileIsInBin({ docId: fileNode.__docId }));
            }
          }
        }
      }),
    );

    // no fileNodes dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return null;
}
