/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { FORMAT_ELEMENT_COMMAND, LexicalEditor } from 'lexical';
import * as React from 'react';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { toolbarButtonStyle } from './ToolbarPlugin';

export default function TextAlignDropDown({
  editor,
  disabled = false,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
}) {
  return (
    <DropDown
      disabled={disabled}
      buttonClassName={toolbarButtonStyle}
      buttonIconClassName="icon"
      buttonLabel="Align"
      buttonAriaLabel="Formatting options for text style"
    >
      <DropDownItem
        className="item"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
      >
        <span className="text">Left Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="item"
      >
        <span className="text">Center Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="item"
      >
        <span className="text">Right Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="item"
      >
        <span className="text">Justify Align</span>
      </DropDownItem>
    </DropDown>
  );
}
