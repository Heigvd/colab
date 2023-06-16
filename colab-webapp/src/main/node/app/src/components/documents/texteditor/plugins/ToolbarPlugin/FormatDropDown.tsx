/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { $createCodeNode } from '@lexical/code';
import { $createHeadingNode, $createQuoteNode, HeadingTagType } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  DEPRECATED_$isGridSelection,
  LexicalEditor,
} from 'lexical';
import React from 'react';
import useTranslations from '../../../../../i18n/I18nContext';
import { MaterialIconsType } from '../../../../../styling/IconType';
import { ghostIconButtonStyle, iconButtonStyle, space_xs } from '../../../../../styling/style';
import DropDownMenu from '../../../../common/layout/DropDownMenu';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';

export const blockTypeToBlockName = {
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  paragraph: 'Normal',
  quote: 'Quote',
};

const blockTypeToBlockIcon: Record<string, MaterialIconsType> = {
  code: 'code',
  h1: 'format_h1',
  h2: 'format_h2',
  h3: 'format_h3',
  h4: 'format_h4',
  h5: 'format_h5',
  h6: 'format_h6',
  paragraph: 'format_paragraph',
  quote: 'format_quote',
};

export function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  editor: LexicalEditor;
  blockType: keyof typeof blockTypeToBlockName;
  disabled?: boolean;
}) {
  const i18n = useTranslations();

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

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection();

        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) selection.insertRawText(textContent);
          }
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const entries = [
    {
      value: 'paragraph',
      label: (
        <>
          <Flex align="center" className="text">
            <Icon color="var(--text-secondary)" opsz="xs" icon="format_paragraph" />
            {i18n.modules.content.textFormat.paragraph}
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
            <Icon color="var(--text-secondary)" opsz="xs" icon="format_h1" />
            {i18n.modules.content.textFormat.heading1}
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
            <Icon color="var(--text-secondary)" opsz="xs" icon="format_h2" />
            {i18n.modules.content.textFormat.heading2}
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
            <Icon color="var(--text-secondary)" opsz="xs" icon="format_h3" />
            {i18n.modules.content.textFormat.heading3}
          </Flex>
        </>
      ),
      action: () => formatHeading('h3'),
    },
    {
      value: 'h4',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" opsz="xs" icon="format_h4" />
            {i18n.modules.content.textFormat.heading4}
          </Flex>
        </>
      ),
      action: () => formatHeading('h4'),
    },
    {
      value: 'h5',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" opsz="xs" icon="format_h5" />
            {i18n.modules.content.textFormat.heading5}
          </Flex>
        </>
      ),
      action: () => formatHeading('h5'),
    },
    {
      value: 'code',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" opsz="xs" icon="code" />
            {i18n.modules.content.textFormat.code}
          </Flex>
        </>
      ),
      action: () => formatCode(),
    },
    {
      value: 'quote',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" opsz="xs" icon="format_quote" />
            {i18n.modules.content.textFormat.quote}
          </Flex>
        </>
      ),
      action: () => formatQuote(),
    },
  ];
  return (
    <>
      <DropDownMenu
        value={blockType}
        entries={entries}
        buttonClassName={cx(iconButtonStyle, ghostIconButtonStyle) + ' block-type'}
        buttonLabel={blockTypeToBlockName[blockType]}
        icon={blockTypeToBlockIcon[blockType]}
        disabled={disabled}
        title={i18n.modules.content.textFormat.formatText}
        menuIcon={'CARET'}
      />
    </>
  );
}
