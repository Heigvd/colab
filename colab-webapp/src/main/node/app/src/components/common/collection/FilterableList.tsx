/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCaretDown, faCaretUp, faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {
  borderRadius,
  lightIconButtonStyle,
  lightLinkStyle,
  lightTheme,
  noOutlineStyle,
  space_S,
} from '../../styling/style';
import Checkbox from '../Form/Checkbox';
import Clickable from '../layout/Clickable';
import Flex from '../layout/Flex';

const categoryTabStyle = cx(
  lightTheme,
  css({
    padding: '0 ' + space_S,
    color: 'var(--darkGray)',
    marginRight: space_S,
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
  onChange: (t: boolean, cat: string) => void;
  tagState?: Record<string, boolean>;
  stateSelectAll: boolean;
  toggleAllTags: (t: boolean) => void;
}

export default function FilterableList({
  className,
  tagClassName,
  tags,
  onChange,
  tagState,
  stateSelectAll,
  toggleAllTags,
}: FilterableListProps): JSX.Element {
  const [filterOpen, setFilterOpen] = React.useState<boolean>(false);
  return (
    <Flex className={className} direction="column" align="stretch">
      <Clickable
        clickableClassName={cx(
          lightIconButtonStyle,
          css({ alignSelf: 'flex-end', '&:hover': { cursor: 'pointer' } }),
        )}
        onClick={() => setFilterOpen(filterOpen => !filterOpen)}
      >
        <FontAwesomeIcon icon={faFilter} size="sm" />
        {' Filter '}
        <FontAwesomeIcon icon={filterOpen ? faCaretUp : faCaretDown} />
      </Clickable>

      <Flex justify={filterOpen ? 'space-between' : 'flex-end'} align="center">
        {filterOpen && (
          <>
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
            <Checkbox
              key={'toggle all'}
              label={'Select all'}
              value={stateSelectAll}
              onChange={t => toggleAllTags(t)}
              className={cx(lightLinkStyle, css({ '&:hover': { textDecoration: 'none' } }))}
            />
          </>
        )}
      </Flex>
    </Flex>
  );
}
