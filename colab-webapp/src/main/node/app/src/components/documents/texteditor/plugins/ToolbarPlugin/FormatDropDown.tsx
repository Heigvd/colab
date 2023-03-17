/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
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
import DropDownMenu from '../../../../common/layout/DropDownMenu';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';
import { ghostIconButtonStyle, iconButtonStyle, space_xs } from '../../../../styling/style';

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

/* function dropDownActiveClass(active: boolean) {
  if (active) return 'active dropdown-item-active';
  else return '';
} */

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

  const entries = [
    {
      value: 'paragraph',
      label: (
        <>
          <Flex align="center" className="text">
            <Icon color='var(--text-secondary)' opsz='xs' icon="format_paragraph" />
            Paragraph
          </Flex>
        </>
      ),
      action: formatParagraph,
    },
    {
      value: 'h1',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color='var(--text-secondary)' opsz='xs' icon="format_h1" />
            Heading 1
          </Flex>
        </>
      ),
      action: () => formatHeading('h1'),
    },
    {
      value: 'h2',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color='var(--text-secondary)' opsz='xs' icon="format_h2" />
            Heading 2
          </Flex>
        </>
      ),
      action: () => formatHeading('h2'),
    },
    {
      value: 'h3',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color='var(--text-secondary)' opsz='xs' icon="format_h3" />
            Heading 3
          </Flex>
        </>
      ),
      action: () => formatHeading('h3'),
    },
    {
      value: 'bullet',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color='var(--text-secondary)' opsz='xs' icon="format_list_bulleted" />
            Bullet List
          </Flex>
        </>
      ),
      action: () => formatBulletList,
    },
    {
      value: 'number',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color='var(--text-secondary)' opsz='xs' icon="format_list_numbered" />
            Numbered List
          </Flex>
        </>
      ),
      action: () => formatNumberedList,
    },
    {
      value: 'check',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color='var(--text-secondary)' opsz='xs' icon="checklist" />
            Check List
          </Flex>
        </>
      ),
      action: () => formatCheckList,
    },
  ];
  return (
    <>
      <DropDownMenu
        value={blockType}
        entries={entries}
        buttonClassName={cx(iconButtonStyle, ghostIconButtonStyle) + ' block-type'}
        buttonLabel={blockTypeToBlockName[blockType]}
        disabled={disabled}
      />
    </>
  );
}
