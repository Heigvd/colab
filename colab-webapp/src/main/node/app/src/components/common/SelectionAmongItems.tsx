/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Flex from '../common/Flex';
import Thumbnail from '../common/Thumbnail';

interface SelectionAmongItemsProps<T> {
  items: T[];
  withEmptyItem?: boolean;
  defaultValue?: T | null;
  fillThumbnail: (item: T | null, highlighted: boolean) => React.ReactNode;
  onSelect: (value: T | null) => void;
}

export default function SelectionAmongItems<T extends { id?: number | undefined | null }>({
  items,
  withEmptyItem,
  defaultValue = null,
  fillThumbnail,
  onSelect,
}: SelectionAmongItemsProps<T>): JSX.Element {
  const [selected, select] = React.useState<T | null>(defaultValue);

  const [effectiveItemList, setEffectiveItemList] = React.useState<(T | null)[]>([]);

  React.useEffect(() => {
    {
      withEmptyItem
        ? setEffectiveItemList(Array<T | null>(null).concat(items))
        : setEffectiveItemList(Array<T | null>().concat(items));
    }
  }, [items, withEmptyItem]);

  return (
    <Flex>
      {effectiveItemList.map(item => (
        <Flex key={item ? item.id : 0}>
          <Thumbnail
            onClick={() => {
              select(item);
              onSelect(item);
            }}
          >
            {fillThumbnail(item, selected === item)}
          </Thumbnail>
        </Flex>
      ))}
    </Flex>
  );
}
