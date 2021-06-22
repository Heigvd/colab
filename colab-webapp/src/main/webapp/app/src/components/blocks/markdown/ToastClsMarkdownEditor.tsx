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

/**
 * Class Comp because FuncComp seems buggy when using a React.createRef
 */
export class ToastClsMarkdownEditor extends React.Component<MarkdownEditorProps> {
  editorRef = React.createRef<Editor>();

  onChange = (): void => {
    const editor = this.editorRef.current;
    if (editor != null) {
      const value = editor.getInstance().getMarkdown();
      logger.info('Onchange MdValue: ', JSON.stringify(value));
      this.props.onChange(value);
    }
  };

  componentDidUpdate = (): void => {
    const editor = this.editorRef.current;
    if (editor != null) {
      const instance = editor.getInstance();
      const currentValue = instance.getMarkdown();
      if (currentValue !== this.props.value) {
        logger.info(
          'Set MarkdownValue old: ',
          JSON.stringify(currentValue),
          ' new ',
          JSON.stringify(this.props.value),
        );
        editor.getInstance().setMarkdown(this.props.value);
      } else {
        logger.info('MdEditor: skip update same value');
      }
    }
  };

  render(): JSX.Element {
    return (
      <Editor
        usageStatistics={false}
        initialEditType="wysiwyg"
        previewStyle="vertical"
        initialValue={this.props.value}
        onChange={this.onChange}
        ref={this.editorRef}
      />
    );
  }
}
