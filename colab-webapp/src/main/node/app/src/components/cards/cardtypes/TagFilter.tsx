/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import Flex from '../../common/Flex';
import Checkbox from '../../common/Form/Checkbox';
import {
  borderRadius,
  lightLinkStyle,
  lightTheme,
  noOutlineStyle,
  space_M,
  space_S,
} from '../../styling/style';

const tagStyle = cx(
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

const checkedTagStyle = css({
  backgroundColor: 'var(--darkGray)',
  color: 'var(--primaryColorContrast)',
  '&:hover': {
    color: 'var(--primaryColorContrast)',
  },
});

interface TagsFilterProps {
  tagsState: Record<string, boolean>; // tags with checked or not
  onChange: (tag: string, value: boolean) => void;
  className?: string;
  tagItemClassName?: string;
}

export default function TagsFilter({
  tagsState,
  onChange,
  className,
  tagItemClassName,
}: TagsFilterProps): JSX.Element {
  const [selectAllState, setSelectAllState] = React.useState<boolean>(false);

  const toggleAllTags = React.useCallback(() => {
    setSelectAllState(!selectAllState);

    Object.keys(tagsState).map(tag => {
      if (tagsState[tag] != selectAllState) {
        onChange(tag, selectAllState);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsState, onChange /* no need to take selectAllState into account */]);

  // TODO work in progress : auto adapt selectAll if state of all is same

  return (
    <Flex className={className} direction="column" align="stretch">
      <Flex justify="space-between" align="center">
        <Flex wrap="wrap">
          {Object.keys(tagsState).map(tag => {
            return (
              <div
                className={cx(
                  tagStyle,
                  {
                    [checkedTagStyle]: tagsState[tag],
                  },
                  tagItemClassName,
                )}
                key={tag}
              >
                <Checkbox
                  key={tag}
                  label={tag}
                  value={tagsState[tag]}
                  onChange={value => onChange(tag, value)}
                  className={cx(noOutlineStyle, {
                    [checkedTagStyle]: tagsState[tag],
                  })}
                />
              </div>
            );
          })}
        </Flex>
        <Checkbox
          key={'toggle all'}
          label={selectAllState ? 'Select all' : 'Deselect all'}
          value={!selectAllState}
          onChange={toggleAllTags}
          className={css({ paddingLeft: space_M })}
          containerClassName={cx(lightLinkStyle, css({ '&:hover': { textDecoration: 'none' } }))}
        />
      </Flex>
    </Flex>
  );
}
