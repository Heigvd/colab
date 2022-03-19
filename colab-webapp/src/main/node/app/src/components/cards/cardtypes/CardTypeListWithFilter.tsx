/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import CardTypeItem from './CardTypeItem';
import TagsFilter from './TagFilter';

// TODO UI see if we have default classnames

interface CardTypeListWithFilterProps {
  cardTypes: CardType[];
  defaultChecked?: boolean;
  filterClassName?: string;
  tagItemClassName?: string;
  cardTypeListClassName?: string;
}

export default function CardTypeListFilterable({
  cardTypes,
  defaultChecked = true,
  filterClassName, // default : css({ paddingBottom: space_S })
  tagItemClassName,
  cardTypeListClassName,
}: CardTypeListWithFilterProps): JSX.Element {
  const [tagsState, setTagsState] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const allTags: string[] = cardTypes.flatMap(ct => ct.tags);

    const updatedTagsState = allTags.reduce<Record<string, boolean>>((accTagsState, curTag) => {
      if (accTagsState[curTag] == null) {
        accTagsState[curTag] = defaultChecked;
      }
      return accTagsState;
    }, tagsState);

    setTagsState(updatedTagsState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardTypes, defaultChecked /* tagsState */]);

  const cardTypesFilteredByTag = cardTypes.filter(ct => {
    const hasNoTag = ct.tags.length == 0;
    const hasMatchingTag = ct.tags.find(tag => tagsState[tag] == true);

    return hasNoTag || hasMatchingTag;
  });

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
      <div className={cardTypeListClassName}>
        {cardTypesFilteredByTag.map(cardType => (
          <CardTypeItem key={cardType.ownId} cardType={cardType} />
        ))}
      </div>
    </>
  );
}
