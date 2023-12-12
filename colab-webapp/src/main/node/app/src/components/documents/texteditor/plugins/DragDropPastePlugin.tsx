/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {DRAG_DROP_PASTE} from '@lexical/rich-text';
import {isMimeType, mediaFileReader} from '@lexical/utils';
import {COMMAND_PRIORITY_LOW} from 'lexical';
import {useEffect} from 'react';
import {INSERT_IMAGE_COMMAND} from "./ImagesPlugin";
import {INSERT_FILE_COMMAND} from "./FilesPlugin";
import {useAppDispatch} from "../../../../store/hooks";
import * as API from '../../../../API/api';
import {DocumentOwnership} from "../../documentCommonType";
import logger from "../../../../logger";


const ACCEPTABLE_IMAGE_TYPES = [
    'image/',
    'image/heic',
    'image/heif',
    'image/gif',
    'image/webp',
];

// Not an exhaustive list, could be handled differently
const ACCEPTABLE_FILE_TYPES = [
    'application/gzip',
    'application/msword',
    'application/pdf',
    'application/vnd.m-xcel',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.rar',
    'application/vnd.ms-powerpoint',
    'application/x-tar',
    'json',
    'officedocument.presentationml',
    'officedocument.spreadsheetml',
    'officedocument.wordprocessingml',
    'text/csv',
    'text/html',
    'text/xml',
    'x-bibtex',
    'x-c',
    'x-java',
    'x-perl',
    'x-python',
    'x-sh',
]

interface DragDropPasteProps {
    docOwnership: DocumentOwnership;
}

export default function DragDropPaste({docOwnership}: DragDropPasteProps): null {
    const dispatch = useAppDispatch();
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerCommand(
            DRAG_DROP_PASTE,
            (files) => {
                (async () => {
                    const filesResult = await mediaFileReader(
                        files,
                        [...ACCEPTABLE_IMAGE_TYPES, ...ACCEPTABLE_FILE_TYPES].flatMap((x) => x),
                    );
                    for (const {file, result} of filesResult) {
                        if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
                            logger.info('image paste')
                            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                altText: file.name,
                                src: result,
                            });
                        } else if (isMimeType(file, ACCEPTABLE_FILE_TYPES)) {
                            logger.info('file paste')
                            dispatch(API.addFile({ docOwnership, file, fileSize: file.size})).then(payload => {
                                editor.dispatchCommand(INSERT_FILE_COMMAND, {
                                    docId: Number(payload.payload),
                                    fileName: file.name,
                                })
                            })
                        }
                    }
                })();
                return true;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor, dispatch, docOwnership]);
    return null;
}