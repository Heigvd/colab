/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import TagsFilter from './TagFilter';

export type DataWithTags = { tags: string[] };

interface DataWithTagsListWithFilterProps {
  dataWithTags: DataWithTags[];
  defaultChecked?: boolean;
  filterClassName?: string;
  tagItemClassName?: string;
  children: (dataWithTags: DataWithTags[]) => JSX.Element;
}

export default function DataWithTagsListWithFilter({
  dataWithTags,
  defaultChecked = true,
  filterClassName, // default : css({ paddingBottom: space_S })
  tagItemClassName,
  children,
}: DataWithTagsListWithFilterProps): JSX.Element {
  const [tagsState, setTagsState] = React.useState<Record<string, boolean>>({});
  const [dataFilteredByTag, setDataFilteredByTag] = React.useState<DataWithTags[]>([]);

  React.useEffect(() => {
    const allTags: string[] = dataWithTags.flatMap(ct => ct.tags);

    const updatedTagsState = allTags.reduce<Record<string, boolean>>((accTagsState, curTag) => {
      if (accTagsState[curTag] == null) {
        accTagsState[curTag] = defaultChecked;
      }
      return accTagsState;
    }, tagsState);

    setTagsState(updatedTagsState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataWithTags, defaultChecked /* tagsState */]);

  React.useEffect(() => {
    setDataFilteredByTag(
      dataWithTags.filter(ct => {
        const hasNoTag = ct.tags.length == 0;
        const hasMatchingTag = ct.tags.find(tag => tagsState[tag] == true);

        return hasNoTag || hasMatchingTag;
      }),
    );
  }, [dataWithTags, tagsState]);

  return (
    <>
      <TagsFilter
        tagsState={tagsState}
        onChange={(tag, value) =>
          setTagsState(state => {
            return { ...state, [tag]: value };
          })
        }
        className={filterClassName}
        tagItemClassName={tagItemClassName}
      />
      {dataWithTags &&
        dataWithTags.length > 0 &&
        (dataFilteredByTag && dataFilteredByTag.length > 0 ? (
          children(dataFilteredByTag)
        ) : (
          <p>Nothing matches tag selection</p>
        ))}
    </>
  );
}
