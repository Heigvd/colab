/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { lightIconButtonStyle, space_lg, space_sm } from '../../styling/style';
import IconButton from '../element/IconButton';
import Flex from './Flex';
import Icon from './Icon';

const bgActiveStyleRight = css({
  backgroundImage: 'linear-gradient( to right, transparent 90%, #444 91%, #444 100%)',
});

export interface Item {
  icon: string;
  nextToIconElement?: React.ReactNode;
  title: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface SideCollapsibleContext<T extends { [key: string]: Item }> {
  items: T;
  openKey?: string | undefined;
  setOpenKey?: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const defaultSideCollapsibleContext: SideCollapsibleContext<{ [key: string]: Item }> = {
  items: {},
  openKey: undefined,
  setOpenKey: () => {},
};

export const SideCollapsibleCtx = React.createContext(defaultSideCollapsibleContext);

export interface SideCollapsiblePanelBodyProps {
  className?: string;
}

export function SideCollapsiblePanelBody({
  className,
}: SideCollapsiblePanelBodyProps): JSX.Element {
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
            padding: space_sm + ' ' + space_lg,
            borderBottom: '1px solid var(--divider-main)',
          })}
        >
          <Flex align="baseline">
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
            className={cx(lightIconButtonStyle)}
          />
        </Flex>
        {itemOpen.children}
      </Flex>
    );
  } else return <></>;
}

export interface SideCollapsibleMenuProps {
  defaultOpenKey?: string;
  className?: string;
  itemClassName?: string;
}

export function SideCollapsibleMenu({
  defaultOpenKey,
  className,
  itemClassName,
}: SideCollapsibleMenuProps): JSX.Element {
  const { items, openKey, setOpenKey } = React.useContext(SideCollapsibleCtx);

  React.useEffect(() => {
    if (defaultOpenKey && setOpenKey) {
      setOpenKey(defaultOpenKey);
    }
  }, [defaultOpenKey, setOpenKey]);

  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="stretch"
      className={cx(className, {
        [css({ width: '0px', overflow: 'hidden', transition: '0.5s' })]: openKey !== undefined,
      })}
    >
      {Object.entries(items).map(([key, item]) => (
        <Flex
          key={key}
          justify="center"
          align="center"
          className={cx(
            css({ padding: space_lg, '&:hover': { cursor: 'pointer' } }),
            {
              [bgActiveStyleRight]: openKey === key,
            },
            lightIconButtonStyle,
            itemClassName,
          )}
          onClick={() => {
            if (setOpenKey) {
              setOpenKey(itemKey => (itemKey === key ? undefined : key));
            }
          }}
        >
          <Icon
            icon={item.icon}
            title={item.title}
            opsz="lg"
            className={css({ paddingLeft: 0, paddingRight: '1px' })}
          />
          {item.nextToIconElement}
        </Flex>
      ))}
    </Flex>
  );
}
