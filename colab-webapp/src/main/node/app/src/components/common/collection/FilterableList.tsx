/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import {
  lightIconButtonStyle,
  lightLinkStyle,
  noOutlineStyle,
  space_sm,
} from '../../styling/style';
import Checkbox from '../element/Checkbox';
import Clickable from '../layout/Clickable';
import Flex from '../layout/Flex';
import Icon from '../layout/Icon';

export const categoryTabStyle = cx(
  css({
    padding: '0 ' + space_sm,
    color: 'var(--secondary-dark)',
    marginRight: space_sm,
    border: '1px solid var(--secondary-dark)',
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
  tagState: Record<string, boolean>;
  toggleAllTags: (t: boolean) => void;
}

export default function FilterableList({
  className,
  tagClassName,
  tags,
  onChange,
  tagState,
  toggleAllTags,
}: FilterableListProps): JSX.Element {
  const i18n = useTranslations();
  const [filterOpen, setFilterOpen] = React.useState<boolean>(false);

  const allSelected = tags.findIndex(tag => !tagState[tag]) < 0;

  return (
    <Flex className={className} direction="column" align="stretch">
      <Clickable
        clickableClassName={cx(
          lightIconButtonStyle,
          css({ alignSelf: 'flex-end', '&:hover': { cursor: 'pointer' } }),
        )}
        onClick={() => setFilterOpen(filterOpen => !filterOpen)}
      >
         <Icon icon={'filter_alt'} opsz="sm" />
        {i18n.common.filter}
         <Icon icon={filterOpen ? 'expand_less' : 'expand_more'} />
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
              label={i18n.common.selectAll}
              value={allSelected}
              onChange={t => toggleAllTags(t)}
              className={cx(lightLinkStyle, css({ '&:hover': { textDecoration: 'none' } }))}
            />
          </>
        )}
      </Flex>
    </Flex>
  );
}
