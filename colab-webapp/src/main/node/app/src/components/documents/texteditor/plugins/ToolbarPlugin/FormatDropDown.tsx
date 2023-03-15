/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  DEPRECATED_$isGridSelection,
  LexicalEditor,
} from 'lexical';
import React from 'react';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import { toolbarButtonStyle } from './ToolbarPlugin';

export const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdown-item-active';
  else return '';
}

export function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  editor: LexicalEditor;
  blockType: keyof typeof blockTypeToBlockName;
  disabled?: boolean;
}) {
  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))
          $setBlocksType(selection, () => $createParagraphNode());
      });
    }
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  return (
    <>
      <DropDown
        disabled={disabled}
        buttonClassName={toolbarButtonStyle}
        buttonIconClassName={'icon block-type ' + blockType}
        buttonLabel={blockTypeToBlockName[blockType]}
        buttonAriaLabel="Formatting options for text style"
      >
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
          onClick={formatParagraph}
        >
          <i className="icon paragraph" />
          <span className="text">Normal</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'h1')}
          onClick={() => formatHeading('h1')}
        >
          <i className="icon h1" />
          <span className="text">Heading 1</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'h2')}
          onClick={() => formatHeading('h2')}
        >
          <i className="icon h2" />
          <span className="text">Heading 2</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'h3')}
          onClick={() => formatHeading('h3')}
        >
          <i className="icon h3" />
          <span className="text">Heading 3</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'bullet')}
          onClick={formatBulletList}
        >
          <i className="icon bullet-list" />
          <span className="text">Bullet List</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'number')}
          onClick={formatNumberedList}
        >
          <i className="icon numbered-list" />
          <span className="text">Numbered List</span>
        </DropDownItem>
        <DropDownItem
          className={'item ' + dropDownActiveClass(blockType === 'check')}
          onClick={formatCheckList}
        >
          <i className="icon check-list" />
          <span className="text">Check List</span>
        </DropDownItem>
      </DropDown>
    </>
  );
}
