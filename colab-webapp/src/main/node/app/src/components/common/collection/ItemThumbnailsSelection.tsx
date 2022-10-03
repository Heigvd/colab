/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { borderRadius, space_S } from '../../styling/style';
import Thumbnail from './Thumbnail';

export const defaultThumbnailStyle = css({
  display: 'flex',
  outline: '4px solid transparent',
  outlineOffset: '-1px',
  border: '1px solid var(--lightGray)',
  borderRadius: borderRadius,
  padding: space_S,
  columnGap: space_S,
  transition: 'outline .3s ease',
  overflow: 'hidden',
  '&:hover': {
    border: '1px solid var(--darkGray)',
  },
});

const selectedStyle = css({
  outline: '4px solid var(--primaryColor)',
});

interface ItemThumbnailsSelectionProps<T> {
  items: T[];
  addEmptyItem?: boolean;
  defaultSelectedValue?: T | null;
  fillThumbnail: (item: T | null, highlighted: boolean) => React.ReactNode;
  thumbnailClassName?: string;
  selectedThumbnailClassName?: string;
  className?: string;
  onItemClick?: (value: T | null) => void;
  onItemDblClick?: (value: T | null) => void;
  selectionnable?: boolean;
  disableOnEnter?: boolean;
}

const gridStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
});
/**
 * to display the items as thumbnails so that one can be selected
 */
export default function ItemThumbnailsSelection<T extends { id?: number | undefined | null }>({
  items,
  addEmptyItem,
  defaultSelectedValue = undefined,
  fillThumbnail,
  thumbnailClassName,
  selectedThumbnailClassName = selectedStyle,
  className,
  onItemClick,
  onItemDblClick,
  selectionnable = true,
  disableOnEnter = false,
}: ItemThumbnailsSelectionProps<T>): JSX.Element {
  const [selected, select] = React.useState<number | undefined>(
    defaultSelectedValue?.id ? defaultSelectedValue.id : undefined,
  );

  const [effectiveItemList, setEffectiveItemList] = React.useState<(T | null)[]>([]);

  React.useEffect(() => {
    {
      addEmptyItem
        ? setEffectiveItemList(Array<T | null>(null).concat(items))
        : setEffectiveItemList(Array<T | null>().concat(items));
    }
  }, [items, addEmptyItem]);

  //<Flex wrap="wrap" className={cx(css({ width: '100%', overflow: 'auto' }), className)}>
  return (
    <div className={cx(className, gridStyle)}>
      {effectiveItemList.map(item => (
        <Thumbnail
          key={item?.id || 0}
          onClick={() => {
            if (selectionnable) {
              select(item?.id || undefined);
            }

            if (onItemClick) {
              onItemClick(item);
            }
          }}
          onDoubleClick={() => {
            if (selectionnable) {
              select(item?.id || undefined);
            }

            if (onItemDblClick) {
              onItemDblClick(item);
            }
          }}
          className={cx(defaultThumbnailStyle, thumbnailClassName, {
            [selectedThumbnailClassName]: selected === item?.id,
          })}
          disableOnEnter={disableOnEnter}
        >
          {fillThumbnail(item, selected === item?.id)}
        </Thumbnail>
      ))}
    </div>
  );
}
