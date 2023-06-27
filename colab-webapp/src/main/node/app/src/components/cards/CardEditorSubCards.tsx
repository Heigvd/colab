/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import 'react-reflex/styles.css';
import { useAndLoadSubCards, useVariantsOrLoad } from '../../store/selectors/cardSelector';
import Flex from '../common/layout/Flex';
import CardThumb from './CardThumb';
import Dndwrapper from './dnd/Dndwrapper';

interface CardEditorDeliverableProps {
  card: Card;
  cardContent: CardContent;
  //readOnly?: boolean;
}
export default function CardEditorDeliverable({
  card,
  cardContent,
}: //readOnly,
CardEditorDeliverableProps): JSX.Element {
  const variants = useVariantsOrLoad(card) || [];

  const subCards = useAndLoadSubCards(cardContent.id);

  return (
    <>
      <Flex className={css({ width: '100%', overflow: 'auto', flexGrow: 1 })}>
        <Dndwrapper cards={subCards}>
          <CardThumb
            card={card}
            variant={cardContent}
            variants={variants}
            showSubcards={true}
            depth={2}
            mayOrganize={true}
            showPreview={false}
            withoutHeader={true}
            coveringColor={false}
          />
        </Dndwrapper>
      </Flex>
    </>
  );
}
