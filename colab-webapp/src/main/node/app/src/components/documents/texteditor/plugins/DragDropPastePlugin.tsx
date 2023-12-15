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
import {useColabConfig} from "../../../../store/selectors/configSelector";
import {addNotification} from "../../../../store/slice/notificationSlice";
import useTranslations from "../../../../i18n/I18nContext";


const ACCEPTABLE_IMAGE_TYPES = [
    'image/',
    'image/heic',
    'image/heif',
    'image/gif',
    'image/webp',
];

// Accept all types except for image and example
const ACCEPTABLE_FILE_TYPES = [
    'application/',
    'audio/',
    'font/',
    'model/',
    'text/',
    'video/',
]

interface DragDropPasteProps {
    docOwnership: DocumentOwnership;
}

export default function DragDropPaste({docOwnership}: DragDropPasteProps): null {
    const dispatch = useAppDispatch();
    const [editor] = useLexicalComposerContext();
    const { fileSizeLimit } = useColabConfig();

    const i18n = useTranslations();

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
                            editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                altText: file.name,
                                src: result,
                            });
                        } else {
                            if (file.size <= fileSizeLimit) {
                                dispatch(API.addFile({docOwnership, file, fileSize: file.size})).then(payload => {
                                    editor.dispatchCommand(INSERT_FILE_COMMAND, {
                                        docId: Number(payload.payload),
                                        fileName: file.name,
                                    })
                                });
                            } else {
                                dispatch(addNotification({
                                    status: 'OPEN',
                                    type: 'ERROR',
                                    message: `${i18n.common.error.fileSizeLimit} ${Math.round(fileSizeLimit/10**6)}MB`,
                                }),)
                            }
                        }
                    }
                })();
                return true;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor, dispatch, docOwnership, fileSizeLimit, i18n.common.error.fileSizeLimit]);
    return null;
}