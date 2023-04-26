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
import { ghostIconButtonStyle, iconButtonStyle, space_xs } from '../../../../../styling/style';
import DropDownMenu from '../../../../common/layout/DropDownMenu';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';

export declare type ListFormatType = 'bullet' | 'number' | 'check';

function buttonPrettyPrint(list: ListFormatType) {
  switch (list) {
    case 'bullet':
      return <Icon opsz="xs" icon={'format_list_bulleted'} />;
    case 'number':
      return <Icon opsz="xs" icon={'format_list_numbered'} />;
    case 'check':
      return <Icon opsz="xs" icon={'checklist'} />;
    default:
      return <Icon opsz="xs" icon={'format_list_bulleted'} />;
  }
}

export const listTypeToListName = {
  number: 'Numbered List',
  bullet: 'Bulleted List',
  check: 'Check List',
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
            Bullet List
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
            Numbered List
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
            Check list
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
        buttonLabel={buttonPrettyPrint(listType)}
        disabled={disabled}
      />
    </>
  );
}
