/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import React, { useState } from 'react';
import { lightItalicText, space_sm } from '../../styling/style';
import Flex from '../layout/Flex';
import { Filters, genericFilter, IFilter } from './Filters';
import SearchInput from './SearchInput';
import Sorters from './Sorters';

export function genericSearch<T>(object: T, properties: Array<keyof T>, query: string): boolean {
  if (query === '') {
    return true;
  }
  return properties.some(property => {
    const value = object[property];
    if (typeof value === 'string' || typeof value === 'number') {
      return value.toString().toLowerCase().includes(query.toLowerCase());
    }
    return false;
  });
}

// export default interface ISorter<T> {

export interface ISorter<T> {
  property: Extract<keyof T, string | number | Date>;
  isDescending: boolean;
}
export function genericSort<T>(objectA: T, objectB: T, sorter: ISorter<T>) {
  const result = () => {
    if (objectA[sorter.property] > objectB[sorter.property]) {
      return 1;
    } else if (objectA[sorter.property] < objectB[sorter.property]) {
      return -1;
    } else {
      return 0;
    }
  };
  return sorter.isDescending ? result() * -1 : result();
}

export interface IWidget {
  title: string;
  description?: string;
  color?: string;
  id: string;
  salut?: string;
  //created: Date;
  //updated: Date;
  //isSpecialCard: boolean;
}
interface SearchSortListProps {
  widgets: Array<IWidget>;
  itemComp: (item: IWidget) => React.ReactNode;
}
export default function SearchSortList({ widgets, itemComp }: SearchSortListProps): JSX.Element {
  const [query, setQuery] = useState<string>('');
  const [activeSorter, setActiveSorter] = useState<ISorter<IWidget>>({
    property: 'title',
    isDescending: true,
  });
  const [activeFilters, setActiveFilters] = useState<Array<IFilter<IWidget>>>([]);

  const resultWidgets = widgets
    .filter((widget: IWidget) => genericSearch<IWidget>(widget, ['title', 'description'], query))
    .filter((widget: IWidget) => genericFilter<IWidget>(widget, activeFilters))
    .sort((widgetA, widgetB) => genericSort<IWidget>(widgetA, widgetB, activeSorter));

  return (
    <Flex direction="column" align="stretch" className={css({ alignSelf: 'stretch' })}>
      <Flex justify="space-between">
        <Sorters<IWidget>
          object={widgets[0]}
          onChangeSorter={(property, isDescending) => {
            setActiveSorter({
              property,
              isDescending,
            });
          }}
        />
        <Filters<IWidget>
          object={widgets[0]}
          filters={activeFilters}
          onChangeFilter={(changedFilterProperty, checked, isTruthyPicked) => {
            checked
              ? setActiveFilters([
                  ...activeFilters.filter(filter => filter.property !== changedFilterProperty),
                  { property: changedFilterProperty, isTruthyPicked },
                ])
              : setActiveFilters(
                  activeFilters.filter(filter => filter.property !== changedFilterProperty),
                );
          }}
        />
        <SearchInput onChangeSearchQuery={(query: string) => setQuery(query)} />
      </Flex>
      {resultWidgets.length > 0 && (
        <Flex gap={space_sm} wrap="wrap">
          {resultWidgets.map(widget => itemComp(widget))}
        </Flex>
      )}

      {resultWidgets.length === 0 && <p className={lightItalicText}>No results found!</p>}
    </Flex>
  );
}
