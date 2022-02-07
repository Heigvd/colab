/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import * as React from 'react';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import {
  lightIconButtonStyle,
  marginAroundStyle,
  paddingAroundStyle,
  space_L,
  space_M,
  space_S,
} from '../styling/style';

interface Item {
  icon: IconProp;
  children: React.ReactNode;
  className?: string;
  title: string;
}

export interface SideCollapsiblePanelProps<T extends { [key: string]: Item }> {
  items: T;
  openKey?: keyof T;
  className?: string;
  direction?: 'LEFT' | 'RIGHT';
}

export default function SideCollapsiblePanel<T extends { [key: string]: Item }>({
  openKey,
  items,
  className,
  direction = 'LEFT',
}: SideCollapsiblePanelProps<T>): JSX.Element {
  const [itemKeyOpen, setItemKeyOpen] = React.useState<keyof T | undefined>(openKey);
  const itemOpen = itemKeyOpen == null ? null : items[itemKeyOpen];
  return (
    <Flex
      direction="row"
      align="stretch"
      className={cx(
        direction === 'LEFT'
          ? css({ borderRight: '1px solid var(--lightGray)' })
          : css({ borderLeft: '1px solid var(--lightGray)' }),
        className,
      )}
    >
      {direction === 'RIGHT' && itemOpen && (
        <Flex
          align="stretch"
          className={cx(paddingAroundStyle([1], space_M), itemOpen.className)}
          title={itemOpen.title}
        >
          {itemOpen.children}
        </Flex>
      )}
      <Flex
        direction="column"
        justify="flex-start"
        align="center"
        grow={1}
        className={cx(
          direction === 'LEFT'
            ? css({ borderRight: '1px solid var(--lightGray)' })
            : css({ borderLeft: '1px solid var(--lightGray)' }),
          css({ padding: space_M + ' ' + space_S }),
        )}
      >
        {Object.entries(items).map(([key, item]) => (
          <IconButton
            key={key}
            icon={item.icon}
            title={item.title}
            onClick={() => setItemKeyOpen(itemKey => (itemKey === key ? undefined : key))}
            iconColor={itemKeyOpen === key ? 'var(--fgColor)' : undefined}
            iconSize="lg"
            className={cx(
              marginAroundStyle([3], space_L),
              lightIconButtonStyle,
              css({ color: 'var(--lightGray)' }),
            )}
          />
        ))}
      </Flex>
      {direction === 'LEFT' && itemOpen && (
        <Flex
          align="stretch"
          className={cx(paddingAroundStyle([1], space_M), itemOpen.className)}
          title={itemOpen.title}
        >
          {itemOpen.children}
        </Flex>
      )}
    </Flex>
  );
}
