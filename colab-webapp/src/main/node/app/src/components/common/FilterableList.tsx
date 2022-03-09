/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import React from 'react';
import { borderRadius, lightTheme, noOutlineStyle, space_S } from '../styling/style';
import Flex from './Flex';
import Checkbox from './Form/Checkbox';

const categoryTabStyle = cx(
  lightTheme,
  css({
    padding: '0 ' + space_S,
    color: 'var(--darkGray)',
    margin: space_S,
    borderRadius: borderRadius,
    border: '1px solid var(--darkGray)',
    userSelect: 'none',
    fontSize: '0.9em',
  }),
);
const checkedCategoryTabStyle = css({
  backgroundColor: 'var(--darkGray)',
  color: 'var(--primaryColorContrast)',
  '&:hover': {
    color: 'var(--primaryColorContrast)',
  },
});

export interface FilterableListProps {
  className?: string;
  tagClassName?: string;
  tags: string[];
  onChange:  (t:boolean, cat: string) => void;
  tagState?: Record<string, boolean>;
  stateSelectAll: boolean;
  toggleAllTags: (t: boolean) => void;

}

// TODO finish this component when the issue with multiple re-renderings will be fixed. 
export default function FilterableList({
  className,
  tagClassName,
  tags,
  onChange,
  tagState,
  stateSelectAll,
  toggleAllTags,
}: FilterableListProps): JSX.Element {
  return (
    <Flex className={className} direction="column" align="stretch">
      <Flex grow={1} justify="flex-end">
        <Checkbox
          key={'toggle all'}
          label={stateSelectAll ? 'Deselect all' : 'Select all'}
          value={stateSelectAll}
          onChange={t => toggleAllTags(t)}
          className={noOutlineStyle}
          containerClassName={css({ color: 'var(--darkGray)' })}
        />
      </Flex>
      <Flex wrap="wrap">
        {tags.map(cat => {
          return (
            <div
              className={cx(
                categoryTabStyle,
                {
                  [checkedCategoryTabStyle]: tagState && tagState[cat],
                },
                tagClassName,
              )}
              key={cat}
            >
              <Checkbox
                key={cat}
                label={cat}
                value={tagState && tagState[cat]}
                onChange={t => onChange(t, cat)}
                className={cx(noOutlineStyle, {
                  [checkedCategoryTabStyle]: tagState && tagState[cat],
                })}
              />
            </div>
          );
        })}
      </Flex>
    </Flex>
  );
}
