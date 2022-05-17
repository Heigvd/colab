/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Flex from './Flex';
import Thumbnail from './Thumbnail';

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
}

/**
 * to display the items as thumbnails so that one can be selected
 */
export default function ItemThumbnailsSelection<T extends { id?: number | undefined | null }>({
  items,
  addEmptyItem,
  defaultSelectedValue = null,
  fillThumbnail,
  thumbnailClassName,
  selectedThumbnailClassName,
  className,
  onItemClick,
  onItemDblClick,
}: ItemThumbnailsSelectionProps<T>): JSX.Element {
  const [selected, select] = React.useState<T | null>(defaultSelectedValue);

  const [effectiveItemList, setEffectiveItemList] = React.useState<(T | null)[]>([]);

  React.useEffect(() => {
    {
      addEmptyItem
        ? setEffectiveItemList(Array<T | null>(null).concat(items))
        : setEffectiveItemList(Array<T | null>().concat(items));
    }
  }, [items, addEmptyItem]);

  return (
    <Flex wrap='wrap' className={cx(css({width: '100%', overflow: 'auto'}), className)}>
      {effectiveItemList.map(item => (
          <Thumbnail
            key={item?.id || 0}
            onClick={() => {
              select(item);

              if (onItemClick) {
                onItemClick(item);
              }
            }}
            onDoubleClick={() => {
              select(item);

              if (onItemDblClick) {
                onItemDblClick(item);
              }
            }}
            className={cx(thumbnailClassName, selected === item && selectedThumbnailClassName)}
          >
            {fillThumbnail(item, selected === item)}
          </Thumbnail>
      ))}
    </Flex>
  );
}
