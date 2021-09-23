/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import 'codemirror/lib/codemirror.css';
import * as React from 'react';
import { logger } from '../../../logger';

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Do not understand why the ref does not work
 */
export default function ToastFnMarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps): JSX.Element {
  const editorRef = React.useRef<{ ref?: Editor }>({});

  const theEditor = editorRef.current.ref;

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
  }, [theEditor, onChange]);

  return (
    <Editor
      ref={ref => {
        if (ref) {
          editorRef.current.ref = ref;
        } else {
          delete editorRef.current.ref;
        }
      }}
      initialValue={value}
      usageStatistics={false}
      initialEditType="wysiwyg"
      previewStyle="vertical"
      onChange={onChangeCb}
    />
  );
}
