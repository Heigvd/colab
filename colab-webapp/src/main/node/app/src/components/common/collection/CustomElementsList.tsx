/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { uniq } from 'lodash';
import * as React from 'react';
import FilterableList from './FilterableList';
import ItemThumbnailsSelection from './ItemThumbnailsSelection';

interface CustomElementsListProps<T> {
  thumbnailContent: (item: T | null, highlighted: boolean) => React.ReactNode;
  items: T[];
  customThumbnailStyle?: string;
  customSelectedClassName?: string;
  customListClassName?: string;
  customTagClassName?: string;
  addEmptyItem?: boolean;
  customOnClick?: (value: T | null) => void;
  customOnDblClick?: (value: T | null) => void;
  selectionnable?: boolean;
}

/**
 * to display the items as thumbnails so that one can be selected
 */
export default function CustomElementsList<
  T extends { id?: number | undefined | null; tags: string[] },
>({
  thumbnailContent,
  items,
  customThumbnailStyle,
  customSelectedClassName,
  customListClassName,
  customTagClassName,
  addEmptyItem,
  customOnClick,
  customOnDblClick,
  selectionnable = true,
}: CustomElementsListProps<T>): JSX.Element {


  const tags = uniq([...items].flatMap(it => (it ? it.tags : [])));
  const [tagState, setTagState] = React.useState<Record<string, boolean>>({});
  //const [selectAllTags, setSelectAllTags] = React.useState<boolean>(true);


  const [selectedElement, setSelectedElement] = React.useState<number | null>(null);


  const activeTags = Object.keys(tagState || []).filter(tag => tagState[tag]);

  const elementsFilteredByTag = activeTags.length > 0 ?
  items.filter(it => it.tags.find(tag => activeTags.includes(tag)))
  : items;

  const toggleAllTags = React.useCallback(
    (val: boolean) => {
      //setSelectAllTags(val);
      setTagState(
        tags.reduce<Record<string, boolean>>((acc, cur) => {
          acc[cur] = val;
          return acc;
        }, {}),
      );
    },
    [tags],
  );

  const onSelect = React.useCallback(
    (value: T | null) => {
      if (customOnClick) {
        customOnClick(value);
      }
      if (!value || !value.id || !selectionnable) {
        setSelectedElement(null);
      } else setSelectedElement(value.id);
    },
    [customOnClick, selectionnable],
  );

  const onDblClick = React.useCallback(
    (value: T | null) => {
      if (customOnDblClick) {
        customOnDblClick(value);
      }
      if (!value || !value.id || !selectionnable) {
        setSelectedElement(null);
      } else setSelectedElement(value.id);
    },
    [customOnDblClick, selectionnable],
  );

  React.useEffect(() => {
    if (selectedElement != null) {
      if (elementsFilteredByTag.find(ct => ct.id === selectedElement) == null) {
        setSelectedElement(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementsFilteredByTag /* no need to take blankTypePseudoId and selectedType into account */]);

  return (
    <>
      {tags && tags.length > 0 && (
        <FilterableList
          tags={tags}
          onChange={(t, cat) =>
            setTagState(state => {
              return { ...state, [cat]: t };
            })
          }
          tagState={tagState}
          toggleAllTags={toggleAllTags}
          tagClassName={customTagClassName}
          className={css({
            displax: 'flex',
            alignItems: 'stretch',
            flexDirection: 'column',
          })}
        />
      )}
      <ItemThumbnailsSelection<T>
        addEmptyItem={addEmptyItem}
        items={elementsFilteredByTag}
        onItemClick={item => {
          onSelect(item);
        }}
        onItemDblClick={item => {
          onDblClick(item);
        }}
        defaultSelectedValue={null}
        fillThumbnail={thumbnailContent}
        selectionnable={selectionnable}
        thumbnailClassName={customThumbnailStyle}
        selectedThumbnailClassName={customSelectedClassName}
        className={customListClassName}
      />
    </>
  );
}
