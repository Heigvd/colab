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
import { LexicalEditor } from 'lexical';
import * as React from 'react';
import useTranslations from '../../../../../i18n/I18nContext';
import { MaterialIconsType } from '../../../../../styling/IconType';
import { ghostIconButtonStyle, iconButtonStyle, space_xs } from '../../../../../styling/style';
import DropDownMenu from '../../../../common/layout/DropDownMenu';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';

export declare type ListFormatType = 'paragraph' | 'bullet' | 'number' | 'check';

export const listTypeToListName = {
  paragraph: 'Paragraph',
  number: 'Numbered List',
  bullet: 'Bulleted List',
  check: 'Check List',
};

const listTypeToListIcon: Record<string, MaterialIconsType> = {
  paragraph: 'format_list_bulleted',
  number: 'format_list_numbered',
  bullet: 'format_list_bulleted',
  check: 'checklist',
};

export default function ListDropDown({
  editor,
  disabled = false,
  listType: listType,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
  listType: keyof typeof listTypeToListName;
}) {
  const i18n = useTranslations();

  const formatBulletList = () => {
    if (listType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (listType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = () => {
    if (listType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const entries = [
    {
      value: 'bullet',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" icon="format_list_bulleted" opsz="xs" />
            {i18n.modules.content.textFormat.bulletList}
          </Flex>
        </>
      ),
      action: () => formatBulletList(),
    },
    {
      value: 'number',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" icon="format_list_numbered" opsz="xs" />
            {i18n.modules.content.textFormat.numberList}
          </Flex>
        </>
      ),
      action: () => formatNumberedList(),
    },
    {
      value: 'checklist',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" icon="checklist" opsz="xs" />
            {i18n.modules.content.textFormat.checkList}
          </Flex>
        </>
      ),
      action: () => formatCheckList(),
    },
  ];
  return (
    <>
      <DropDownMenu
        value={listType}
        entries={entries}
        buttonClassName={cx(iconButtonStyle, ghostIconButtonStyle)}
        buttonLabel={<Icon opsz="xs" icon={listTypeToListIcon[listType]!} />}
        disabled={disabled}
        title={i18n.modules.content.textFormat.formatList}
        menuIcon={'CARET'}
      />
    </>
  );
}
