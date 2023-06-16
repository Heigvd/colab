/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { cx } from '@emotion/css';
import { ElementFormatType, FORMAT_ELEMENT_COMMAND, LexicalEditor } from 'lexical';
import * as React from 'react';
import useTranslations from '../../../../../i18n/I18nContext';
import { ghostIconButtonStyle, iconButtonStyle, space_xs } from '../../../../../styling/style';
import DropDownMenu from '../../../../common/layout/DropDownMenu';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';

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
  const i18n = useTranslations();

  const entries = [
    {
      value: 'left',
      label: (
        <>
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" icon="format_align_left" opsz="xs" />
            {i18n.modules.content.textFormat.leftAlign}
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
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" icon="format_align_center" opsz="xs" />
            {i18n.modules.content.textFormat.centerAlign}
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
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" icon="format_align_right" opsz="xs" />
            {i18n.modules.content.textFormat.rightAlign}
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
          <Flex align="center" gap={space_xs} className="text">
            <Icon color="var(--text-secondary)" icon="format_align_justify" opsz="xs" />
            {i18n.modules.content.textFormat.justify}
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
        menuIcon={'CARET'}
      />
    </>
  );
}
