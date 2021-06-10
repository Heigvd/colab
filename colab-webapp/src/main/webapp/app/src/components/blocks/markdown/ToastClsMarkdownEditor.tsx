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

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export interface MarkdownEditorState {
  value: string;
}

export class ToastClsMarkdownEditor extends React.Component<
  MarkdownEditorProps,
  MarkdownEditorState
> {
  editorRef = React.createRef<Editor>();

  state: MarkdownEditorState = { value: this.props.value };

  onChange = (): void => {
    const editor = this.editorRef.current;
    if (editor != null) {
      const value = editor.getInstance().getMarkdown();
      if (value !== this.state.value) {
        this.props.onChange(value);
      }
    }
  };

  componentDidUpdate = (): void => {
    const editor = this.editorRef.current;
    if (editor != null) {
      if (this.state.value != this.props.value) {
        this.setState(state => ({ ...state, value: this.props.value }));
        editor.getInstance().setMarkdown(this.props.value);
      }
    }
  };

  render(): JSX.Element {
    return (
      <Editor
        usageStatistics={false}
        initialEditType="wysiwyg"
        previewStyle="vertical"
        initialValue={this.state.value}
        onChange={this.onChange}
        ref={this.editorRef}
      />
    );
  }
}
