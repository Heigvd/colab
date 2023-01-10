/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { FlexProps } from './Flex';

interface EllipsisProps<T> {
  items: T[];
  itemComp: (item: T) => React.ReactNode;
  alignEllipsis: FlexProps['align'];
  ellipsis?: React.ReactNode;
  containerClassName?: string;
}

const containerStyle = css({
  width: '100%',
  position: 'relative',
});

const itemsStyle = css({
  display: 'flex',
  position: 'absolute',
});

const defaultEllipsis = <FontAwesomeIcon color={'var(--lightGray)'} icon={faEllipsis} />;

/**
 * items comp: the must all be the same size
 */
export default function Ellipsis<T>({
  items,
  itemComp,
  alignEllipsis,
  ellipsis = defaultEllipsis,
  containerClassName,
}: EllipsisProps<T>): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>();
  const itemsRef = React.useRef<HTMLDivElement>(null);
  const ellipsisRef = React.useRef<HTMLDivElement>(null);

  const resizeObserver = React.useRef<ResizeObserver | undefined>();

  const [num, setNum] = React.useState(items.length);

  const visibleItems = items.slice(0, Math.min(num, items.length));

  const sync = React.useCallback(() => {
    if (containerRef.current && itemsRef.current && ellipsisRef.current) {
      const bbox = containerRef.current.getBoundingClientRect();
      const itemsBox = itemsRef.current.getBoundingClientRect();
      const ellipsisBox = ellipsisRef.current.getBoundingClientRect();

      if (
        itemsBox.width > bbox.width || // item overflow
        num < items.length // maybe some room to display more item
      ) {
        const itemWidth = (itemsBox.width - ellipsisBox.width) / num;
        if (itemWidth * items.length < bbox.width) {
          setNum(items.length);
        } else {
          const itemsCount = Math.floor((bbox.width - ellipsisBox.width) / itemWidth);
          setNum(itemsCount);
        }
      }
    }
  }, [items.length, num]);

  React.useEffect(() => {
    sync();
  }, [sync]);

  const setContainerRef = React.useCallback(
    (container: HTMLDivElement | null) => {
      if (resizeObserver.current != null) {
        resizeObserver.current.disconnect();
      }
      if (container) {
        const ro = new ResizeObserver(() => {
          sync();
        });

        ro.observe(container);
        resizeObserver.current = ro;
      }

      containerRef.current = container || undefined;
    },
    [sync],
  );

  const showEllipsis = num < items.length;

  return (
    <div className={containerStyle + ' CONTAINER ' + containerClassName} ref={setContainerRef}>
      <div className={itemsStyle + ' ITEMS'} ref={itemsRef}>
        {visibleItems.map(item => itemComp(item))}
        <div
          ref={ellipsisRef}
          className={css({
            visibility: showEllipsis ? 'visible' : 'hidden',
            alignSelf: alignEllipsis,
          })}
        >
          {ellipsis}
        </div>
      </div>
    </div>
  );
}
