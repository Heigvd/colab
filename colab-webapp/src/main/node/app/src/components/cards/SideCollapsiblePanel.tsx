/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import * as React from 'react';
import logger from '../../logger';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import { lightIconButtonStyle, marginAroundStyle, paddingAroundStyle, space_M, space_S } from '../styling/style';

interface Item {
  icon: IconProp;
  children: React.ReactNode;
  className?: string;
  title: string;
}

export interface SideCollapsiblePanelProps {
  items: Item[];
  open: Item | null;
  className?: string;
  direction?: 'LEFT' | 'RIGHT';
}

export default function SideCollapsiblePanel({
  open,
  items,
  className,
  direction = 'LEFT',
}: SideCollapsiblePanelProps): JSX.Element {
  const [itemOpen, setItemOpen] = React.useState<Item | null>(open);
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
      {logger.info(itemOpen)}
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
        
        {items.map(item => (
          <>
            <IconButton
              icon={item.icon}
              title={item.title}
              onClick={() => setItemOpen(itemOpen === item ? null : item)}
              iconColor={itemOpen === item ? 'var(--fgColor)' : undefined}
              iconSize='lg'
              className={cx(marginAroundStyle([1, 3], space_M), lightIconButtonStyle, css({color: 'var(--lightGray)'}))}
            />
          </>
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
