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
import { useAndLoadSubCards, useProjectRootCard } from '../../../store/selectors/cardSelector';
import Flex from '../../common/layout/Flex';
import CardView from './CardView';

// Debug value when not in project
const projectId = 27;

const logger = getLogger('ListView');
logger.setLevel(4);

export default function ListView(): JSX.Element {
  const dispatch = useAppDispatch();

  // DEPLOYMENT USE
  //   const currentProjectId = useCurrentProjectId();
  const root = useProjectRootCard(projectId);

  const rootContent = useAppSelector(state => {
    if (entityIs(root, 'Card') && root.id! != null) {
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

  const subCards = useAndLoadSubCards(rootContent?.id);

  if (subCards !== undefined && subCards !== null) {
    subCards.sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });
  }

  logger.info('subCards: ', subCards);

  return (
    <>
      <Flex align="center" direction="column" grow={1} className={css({ margin: '40px 10px' })}>
        {subCards && subCards?.length > 0 && (
          <>
            {subCards.map(card => (
              <div key={card.id}>
                <CardView card={card} />
              </div>
            ))}
          </>
        )}
      </Flex>
    </>
  );
}
