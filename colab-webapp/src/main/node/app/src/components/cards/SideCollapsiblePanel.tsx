/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Resizable } from 're-resizable';
import * as React from 'react';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import {
  lightIconButtonStyle,
  marginAroundStyle,
  paddingAroundStyle,
  space_M,
} from '../styling/style';

const bgActiveStyleRight = css({
  backgroundImage: 'linear-gradient( to right, transparent 90%, #444 91%, #444 100%)',
});
const bgActiveStyleLeft = css({
  backgroundImage: 'linear-gradient( to left, transparent 90%, #444 91%, #444 100%)',
});

interface Item {
  icon: IconProp;
  children: React.ReactNode;
  className?: string;
  title: string;
  nextToTitleElement?: React.ReactNode;
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
        <Resizable
          defaultSize={{
            width: 'auto',
            height: 'auto',
          }}
          minWidth={280}
          maxWidth={'100%'}
          bounds={'parent'}
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: true,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
        >
          <Flex
            align="stretch"
            justify="stretch"
            direction="column"
            className={css({ height: '100%' })}
          >
            <Flex
              justify="space-between"
              className={css({
                padding: space_M,
                paddingBottom: '3px',
                borderBottom: '1px solid var(--lightGray)',
              })}
            >
              <Flex align="center">
                <h3>{itemOpen.title}</h3>
                {itemOpen.nextToTitleElement}
              </Flex>
              <IconButton
                title="close"
                icon={faTimes}
                onClick={() => setItemKeyOpen(undefined)}
                className={cx(lightIconButtonStyle, marginAroundStyle([4], space_M))}
              />
            </Flex>
            <Flex align="stretch" grow={1} className={itemOpen.className}>
              {itemOpen.children}
            </Flex>
          </Flex>
        </Resizable>
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
              lightIconButtonStyle,
              css({ color: 'var(--lightGray)', padding: space_M }),
              { [bgActiveStyleRight]: itemKeyOpen === key && direction === 'RIGHT' },
              { [bgActiveStyleLeft]: itemKeyOpen === key && direction === 'LEFT' },
            )}
          />
        ))}
      </Flex>
      {direction === 'LEFT' && itemOpen && (
        <Resizable
          defaultSize={{
            width: 'auto',
            height: 'auto',
          }}
          minWidth={280}
          maxWidth={'100%'}
          bounds={'parent'}
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
        >
          <Flex
            align="stretch"
            className={cx(paddingAroundStyle([1], space_M), itemOpen.className)}
          >
            {itemOpen.children}
          </Flex>
        </Resizable>
      )}
    </Flex>
  );
}
