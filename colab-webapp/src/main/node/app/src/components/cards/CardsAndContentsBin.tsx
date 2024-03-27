/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import {
  useAllDeletedProjectCardsSorted,
  useDeletedCardContentsToDisplaySorted,
} from '../../store/selectors/cardSelector';
import { p_3xl, p_lg, space_lg, space_sm } from '../../styling/style';
import Flex from '../common/layout/Flex';
import CardContentsBin from './CardContentsBin';
import CardsBin from './CardsBin';

export default function CardsAndCardContentsBin(): React.ReactElement {
  const i18n = useTranslations();

  const cards = useAllDeletedProjectCardsSorted();
  const cardContents = useDeletedCardContentsToDisplaySorted();

  const infoDeletion = (
    <Flex className={css({ fontSize: '0.8em', padding: space_sm })}>
      {i18n.common.bin.info.autoDeletion('30')}
    </Flex>
  );

  if (cards.length == 0 && cardContents.length == 0) {
    return (
      <Flex direction="column" className={p_lg}>
        {infoDeletion}
        <Flex justify="center" className={cx(p_3xl, css({ alignSelf: 'center' }))}>
          {i18n.common.bin.info.isEmpty}
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={space_lg} className={p_lg}>
      {infoDeletion}
      {cards.length > 0 && (
        <Flex direction="column">
          <h4>{i18n.modules.card.cards}</h4>
          <CardsBin />
        </Flex>
      )}
      {cardContents.length > 0 && (
        <Flex direction="column">
          <h4>{i18n.modules.card.variants}</h4>
          <CardContentsBin />
        </Flex>
      )}
    </Flex>
  );
}
