/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import { getLogger } from '../../../logger';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useProjectRootCard } from '../../../store/selectors/cardSelector';
import { useCurrentProjectId } from '../../../store/selectors/projectSelector';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import ListView from './ListView';

const logger = getLogger('ListViewRoot');
logger.setLevel(4);

export default function ListViewRoot(): JSX.Element {
  const dispatch = useAppDispatch();

  const projectId = useCurrentProjectId();
  const root = useProjectRootCard(projectId);

  const rootContent = useAppSelector(state => {
    if (entityIs(root, 'Card') && root.id != null) {
      const card = state.cards.cards[root.id];
      if (card != null) {
        if (card.contents === undefined) return undefined;
        if (card.contents === null) return null;

        const contents = Object.values(card.contents);
        if (contents.length === 0) return null;

        return state.cards.contents[contents[0]!]!.content;
      }
    }
  });

  React.useEffect(() => {
    if (entityIs(root, 'Card') && root.id != null && rootContent === undefined) {
      dispatch(API.getCardContents(root.id));
    }
  }, [dispatch, root, rootContent]);

  logger.info(rootContent);

  return (
    <>
      {rootContent != null ? (
        <Flex align="center" direction="column" grow={1} className={css({ margin: '40px 10px' })}>
          <ListView content={rootContent} />
        </Flex>
      ) : (
        <InlineLoading />
      )}
    </>
  );
}
