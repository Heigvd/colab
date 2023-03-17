/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { cx } from '@emotion/css';
import { ElementFormatType, FORMAT_ELEMENT_COMMAND, LexicalEditor } from 'lexical';
import * as React from 'react';
import DropDownMenu from '../../../../common/layout/DropDownMenu';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';
import { ghostIconButtonStyle, iconButtonStyle } from '../../../../styling/style';

function buttonPrettyPrint(alignment: ElementFormatType) {
  switch (alignment) {
    case 'left':
      return <Icon opsz="xs" icon={'format_align_left'} />;
    case 'center':
      return <Icon opsz="xs" icon={'format_align_center'} />;
    case 'right':
      return <Icon opsz="xs" icon={'format_align_right'} />;
    case 'justify':
      return <Icon opsz="xs" icon={'format_align_justify'} />;
    default:
      return <Icon opsz="xs" icon={'format_align_left'} />;
  }
}

export default function TextAlignDropDown({
  editor,
  alignment,
  disabled = false,
}: {
  editor: LexicalEditor;
  alignment: ElementFormatType;
  disabled?: boolean;
}) {
  const entries = [
    {
      value: 'left',
      label: (
        <>
          <Flex align="center" className="text">
            <Icon icon="format_align_left" />
            Left align
          </Flex>
        </>
      ),
      action: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
      },
    },
    {
      value: 'center',
      label: (
        <>
          <Flex align="center" className="text">
            <Icon icon="format_align_center" />
            Center align
          </Flex>
        </>
      ),
      action: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
      },
    },
    {
      value: 'right',
      label: (
        <>
          <Flex align="center" className="text">
            <Icon icon="format_align_right" />
            Right align
          </Flex>
        </>
      ),
      action: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
      },
    },
    {
      value: 'justify',
      label: (
        <>
          <Flex align="center" className="text">
            <Icon icon="format_align_justify" />
            Justify
          </Flex>
        </>
      ),
      action: () => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
      },
    },
  ];
  return (
    <>
      <DropDownMenu
        value={alignment}
        entries={entries}
        buttonClassName={cx(iconButtonStyle, ghostIconButtonStyle)}
        buttonLabel={buttonPrettyPrint(alignment)}
        disabled={disabled}
      />
    </>
  );
}
