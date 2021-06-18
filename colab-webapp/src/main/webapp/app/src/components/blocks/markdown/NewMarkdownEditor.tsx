/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';

import { Editor } from '@toast-ui/react-editor';
import logger from '../../../logger';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps): JSX.Element {
  const editorRef = React.createRef<Editor>();

  const theEditor = editorRef.current;

  React.useEffect(() => {
    logger.info('MDEditor value props changed: ', value);
    if (theEditor != null) {
      theEditor.getInstance().setMarkdown(value);
    } else {
      logger.error('Editor.effect ref is null');
    }
  }, [value, theEditor]);

  const onChangeCb = React.useCallback(() => {
    if (theEditor != null) {
      const value = theEditor.getInstance().getMarkdown();
      logger.info('MdEditor onChange: ', value);
      onChange(value);
    } else {
      logger.error('Editor.onChange ref is null');
    }
  }, [theEditor]);

  return (
    <Editor
      ref={editorRef}
      initialValue={value}
      usageStatistics={false}
      initialEditType="wysiwyg"
      previewStyle="vertical"
      onChange={onChangeCb}
    />
  );
}
