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
import { MaterialIconsType } from '../../../../../styling/IconType';
import { ghostIconButtonStyle, iconButtonStyle, space_xs } from '../../../../../styling/style';
import DropDownMenu from '../../../../common/layout/DropDownMenu';
import Flex from '../../../../common/layout/Flex';
import Icon from '../../../../common/layout/Icon';
import { UPDATE_TOOLBAR_COMMAND } from './ToolbarPlugin';

const elementFormatTypeToIcon: Record<string, MaterialIconsType> = {
  left: 'format_align_left',
  center: 'format_align_center',
  right: 'format_align_right',
  justify: 'format_align_justify',
};

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
        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, true);
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
        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, true);
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
        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, true);
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
        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, true);
      },
    },
  ];
  return (
    <>
      <DropDownMenu
        value={alignment}
        entries={entries}
        buttonClassName={cx(iconButtonStyle, ghostIconButtonStyle)}
        buttonLabel={
          <Icon opsz="xs" icon={elementFormatTypeToIcon[alignment] || 'format_align_left'} />
        }
        disabled={disabled}
        title={i18n.modules.content.textFormat.alignText}
        menuIcon={'CARET'}
      />
    </>
  );
}
