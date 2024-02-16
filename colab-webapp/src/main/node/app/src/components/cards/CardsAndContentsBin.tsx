/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import {
  useAllDeletedProjectCardsSorted,
  useDeletedCardContentsToDisplaySorted,
} from '../../store/selectors/cardSelector';
import { p_3xl, p_lg } from '../../styling/style';
import Flex from '../common/layout/Flex';
import CardContentsBin from './CardContentsBin';
import CardsBin from './CardsBin';

export default function CardsAndCardContentsBin(): React.ReactElement {
  const i18n = useTranslations();

  const cards = useAllDeletedProjectCardsSorted();
  const cardContents = useDeletedCardContentsToDisplaySorted();

  if (cards.length == 0 && cardContents.length == 0) {
    return (
      <Flex justify="center" className={p_3xl}>
        {i18n.common.bin.info.isEmpty}
      </Flex>
    );
  }

  return (
    <Flex direction="column" className={p_lg}>
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
