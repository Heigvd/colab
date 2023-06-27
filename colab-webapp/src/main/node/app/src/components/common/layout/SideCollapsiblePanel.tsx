/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { lightIconButtonStyle, p_2xs, space_md, space_xs } from '../../../styling/style';
import IconButton from '../element/IconButton';
import Flex from './Flex';
import { SideCollapsibleCtx } from './SideCollapsibleContext';

export interface SideCollapsiblePanelProps {
  className?: string;
}

export default function SideCollapsiblePanel({
  className,
}: SideCollapsiblePanelProps): JSX.Element {
  const i18n = useTranslations();

  const { items, openKey, setOpenKey } = React.useContext(SideCollapsibleCtx);

  const itemOpen = openKey == null ? null : items[openKey];

  if (itemOpen) {
    return (
      <Flex align="stretch" direction="column" grow={1} className={className}>
        <Flex
          justify="space-between"
          align="center"
          className={css({
            padding: space_xs + ' ' + space_md,
            borderBottom: '1px solid var(--divider-main)',
          })}
        >
          <Flex align="center">
            {itemOpen.header ? itemOpen.header : <h2>{itemOpen.title}</h2>}
          </Flex>
          <IconButton
            icon={'close'}
            title={i18n.common.close}
            onClick={() => {
              if (setOpenKey) {
                setOpenKey(undefined);
              }
            }}
            className={cx(lightIconButtonStyle, p_2xs)}
          />
        </Flex>
        {itemOpen.children}
      </Flex>
    );
  } else return <></>;
}
